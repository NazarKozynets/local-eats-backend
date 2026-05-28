import { MarkOrderDeliveredUseCase } from './mark-order-delivered.use-case';
import { MarkOrderDeliveredCommand } from './mark-order-delivered.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { OrderDeliveredEvent } from '../../../domain/events/order-delivered.event';
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

describe('MarkOrderDeliveredUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let orderWriter: ReturnType<typeof createMockOrderDeliveryWriter>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let courierDeliveryWriter: ReturnType<typeof createMockCourierDeliveryWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkOrderDeliveredUseCase;

    const command = () =>
        MarkOrderDeliveredCommand.create({ currentUserId: TEST_COURIER_USER_ID, orderId: TEST_ORDER_ID });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        orderWriter = createMockOrderDeliveryWriter();
        courierAccessReader = createMockCourierAccessReader();
        courierDeliveryWriter = createMockCourierDeliveryWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkOrderDeliveredUseCase(
            orderReader,
            orderWriter,
            courierAccessReader,
            courierDeliveryWriter,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        courierDeliveryWriter.markOnline.mockResolvedValue(undefined);
        courierDeliveryWriter.incrementCompletedDeliveries.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when order status is not DELIVERING', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.PICKED_UP }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('marks delivered, sets courier online, increments count, and publishes event', async () => {
        const deliveredAt = new Date();
        const resultView = buildOrderDeliveryView({
            status: OrderStatus.DELIVERED,
            deliveredAt,
        });
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.DELIVERING }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderWriter.markDelivered.mockResolvedValue(resultView);

        const result = await useCase.execute(command());

        expect(orderWriter.markDelivered).toHaveBeenCalledWith(TEST_ORDER_ID, TEST_COURIER_USER_ID);
        expect(courierDeliveryWriter.markOnline).toHaveBeenCalledWith(TEST_COURIER_PROFILE_ID);
        expect(courierDeliveryWriter.incrementCompletedDeliveries).toHaveBeenCalledWith(TEST_COURIER_PROFILE_ID);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderDeliveredEvent)]),
        );
        expect(result).toBe(resultView);
    });
});
