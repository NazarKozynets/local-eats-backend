import { AssignCourierToOrderUseCase } from './assign-courier-to-order.use-case';
import { AssignCourierToOrderCommand } from './assign-courier-to-order.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { OrderNotReadyForDeliveryError } from '../../../domain/errors/order-not-ready-for-delivery.error';
import { CourierNotReadyForDeliveryError } from '../../../domain/errors/courier-not-ready-for-delivery.error';
import { CourierAlreadyHasActiveDeliveryError } from '../../../domain/errors/courier-already-has-active-delivery.error';
import { DeliveryAssignedEvent } from '../../../domain/events/delivery-assigned.event';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_PROFILE_ID,
    TEST_MANAGER_USER_ID,
    TEST_ADMIN_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockOrderDeliveryWriter,
    createMockCourierAccessReader,
    createMockCourierDeliveryWriter,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('AssignCourierToOrderUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let orderWriter: ReturnType<typeof createMockOrderDeliveryWriter>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let courierDeliveryWriter: ReturnType<typeof createMockCourierDeliveryWriter>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: AssignCourierToOrderUseCase;

    const managerCommand = () =>
        AssignCourierToOrderCommand.create({
            actorUserId: TEST_MANAGER_USER_ID,
            actorRole: UserRole.RESTAURANT_MANAGER,
            orderId: TEST_ORDER_ID,
            courierProfileId: TEST_COURIER_PROFILE_ID,
        });

    const adminCommand = () =>
        AssignCourierToOrderCommand.create({
            actorUserId: TEST_ADMIN_USER_ID,
            actorRole: UserRole.ADMIN,
            orderId: TEST_ORDER_ID,
            courierProfileId: TEST_COURIER_PROFILE_ID,
        });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        orderWriter = createMockOrderDeliveryWriter();
        courierAccessReader = createMockCourierAccessReader();
        courierDeliveryWriter = createMockCourierDeliveryWriter();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new AssignCourierToOrderUseCase(
            orderReader,
            orderWriter,
            courierAccessReader,
            courierDeliveryWriter,
            restaurantAccessReader,
            eventPublisher,
            null,
        );

        eventPublisher.publishAll.mockResolvedValue(undefined);
        courierDeliveryWriter.markBusy.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when manager cannot manage the restaurant', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('throws OrderNotReadyForDeliveryError when order is not READY_FOR_PICKUP', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(OrderNotReadyForDeliveryError);
    });

    it('throws CourierNotReadyForDeliveryError when courier does not exist', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        courierAccessReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(CourierNotReadyForDeliveryError);
    });

    it('throws CourierNotReadyForDeliveryError when courier is not ready', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        courierAccessReader.findById.mockResolvedValue(buildCourierAccessView());
        courierAccessReader.isCourierReadyForDelivery.mockResolvedValue(false);
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(CourierNotReadyForDeliveryError);
    });

    it('throws CourierAlreadyHasActiveDeliveryError when courier has active delivery', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        courierAccessReader.findById.mockResolvedValue(buildCourierAccessView());
        courierAccessReader.isCourierReadyForDelivery.mockResolvedValue(true);
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(buildOrderDeliveryView());
        await expect(useCase.execute(managerCommand())).rejects.toBeInstanceOf(CourierAlreadyHasActiveDeliveryError);
    });

    it('assigns courier and marks courier busy on success', async () => {
        const resultView = buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER });
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        courierAccessReader.findById.mockResolvedValue(buildCourierAccessView());
        courierAccessReader.isCourierReadyForDelivery.mockResolvedValue(true);
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(null);
        orderWriter.assignCourier.mockResolvedValue(resultView);

        const result = await useCase.execute(managerCommand());

        expect(orderWriter.assignCourier).toHaveBeenCalledWith(
            TEST_ORDER_ID,
            TEST_COURIER_PROFILE_ID,
            TEST_MANAGER_USER_ID,
        );
        expect(courierDeliveryWriter.markBusy).toHaveBeenCalledWith(TEST_COURIER_PROFILE_ID);
        expect(result).toBe(resultView);
    });

    it('skips restaurant access check when actor is ADMIN', async () => {
        const resultView = buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER });
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ restaurantId: TEST_RESTAURANT_ID, status: OrderStatus.READY_FOR_PICKUP }),
        );
        courierAccessReader.findById.mockResolvedValue(buildCourierAccessView());
        courierAccessReader.isCourierReadyForDelivery.mockResolvedValue(true);
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(null);
        orderWriter.assignCourier.mockResolvedValue(resultView);

        await useCase.execute(adminCommand());

        expect(restaurantAccessReader.canManageRestaurant).not.toHaveBeenCalled();
    });

    it('publishes DeliveryAssignedEvent on success', async () => {
        const resultView = buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER });
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.READY_FOR_PICKUP }),
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        courierAccessReader.findById.mockResolvedValue(buildCourierAccessView());
        courierAccessReader.isCourierReadyForDelivery.mockResolvedValue(true);
        orderReader.findActiveDeliveryByCourierId.mockResolvedValue(null);
        orderWriter.assignCourier.mockResolvedValue(resultView);

        await useCase.execute(managerCommand());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryAssignedEvent)]),
        );
    });
});
