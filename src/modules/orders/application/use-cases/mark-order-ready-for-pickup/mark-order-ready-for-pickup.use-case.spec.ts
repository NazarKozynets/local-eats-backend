import { MarkOrderReadyForPickupUseCase } from './mark-order-ready-for-pickup.use-case';
import { MarkOrderReadyForPickupCommand } from './mark-order-ready-for-pickup.command';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { InvalidOrderStatusTransitionError } from '../../../domain/errors/invalid-order-status-transition.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderReadyForPickupEvent } from '../../../domain/events/order-ready-for-pickup.event';
import {
    TEST_USER_ID,
    TEST_ORDER_ID,
    buildOrder,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('MarkOrderReadyForPickupUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkOrderReadyForPickupUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkOrderReadyForPickupUseCase(orderRepository, restaurantAccessReader, eventPublisher);
        orderRepository.saveWithHistory.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        MarkOrderReadyForPickupCommand.create({ currentUserId: TEST_USER_ID, orderId: TEST_ORDER_ID });

    it('throws OrderNotFoundError when order does not exist', async () => {
        orderRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderRestaurantAccessDeniedError when user cannot manage restaurant', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.PREPARING }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderRestaurantAccessDeniedError);
    });

    it('throws InvalidOrderStatusTransitionError when order is not PREPARING', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.ACCEPTED_BY_RESTAURANT }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidOrderStatusTransitionError);
    });

    it('sets order status to READY_FOR_PICKUP and sets readyAt', async () => {
        const order = buildOrder({ status: OrderStatus.PREPARING });
        orderRepository.findById.mockResolvedValue(order);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(order.status).toBe(OrderStatus.READY_FOR_PICKUP);
        expect(order.readyAt).not.toBeNull();
        expect(orderRepository.saveWithHistory).toHaveBeenCalledWith(
            order,
            expect.objectContaining({ status: OrderStatus.READY_FOR_PICKUP }),
        );
    });

    it('publishes OrderReadyForPickupEvent', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.PREPARING }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderReadyForPickupEvent)]),
        );
    });
});
