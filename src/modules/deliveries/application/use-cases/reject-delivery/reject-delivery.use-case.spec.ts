import { RejectDeliveryUseCase } from './reject-delivery.use-case';
import { RejectDeliveryCommand } from './reject-delivery.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryRejectedEvent } from '../../../domain/events/delivery-rejected.event';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_PROFILE_ID,
    TEST_COURIER_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockOrderDeliveryWriter,
    createMockCourierAccessReader,
    createMockCourierDeliveryWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('RejectDeliveryUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let orderWriter: ReturnType<typeof createMockOrderDeliveryWriter>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let courierDeliveryWriter: ReturnType<typeof createMockCourierDeliveryWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RejectDeliveryUseCase;

    const command = () =>
        RejectDeliveryCommand.create({
            currentUserId: TEST_COURIER_USER_ID,
            orderId: TEST_ORDER_ID,
            reason: 'Too far',
        });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        orderWriter = createMockOrderDeliveryWriter();
        courierAccessReader = createMockCourierAccessReader();
        courierDeliveryWriter = createMockCourierDeliveryWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new RejectDeliveryUseCase(
            orderReader,
            orderWriter,
            courierAccessReader,
            courierDeliveryWriter,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        courierDeliveryWriter.markOnline.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when courier has no profile', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView());
        courierAccessReader.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('throws DeliveryAccessDeniedError when order is not ASSIGNED_TO_COURIER', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.PICKED_UP }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('unassigns courier, marks courier online, and publishes event on success', async () => {
        const resultView = buildOrderDeliveryView({
            status: OrderStatus.READY_FOR_PICKUP,
            courierId: null,
        });
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView());
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderWriter.unassignCourier.mockResolvedValue(resultView);

        const result = await useCase.execute(command());

        expect(orderWriter.unassignCourier).toHaveBeenCalledWith(TEST_ORDER_ID, TEST_COURIER_USER_ID);
        expect(courierDeliveryWriter.markOnline).toHaveBeenCalledWith(TEST_COURIER_PROFILE_ID);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryRejectedEvent)]),
        );
        expect(result).toBe(resultView);
    });
});
