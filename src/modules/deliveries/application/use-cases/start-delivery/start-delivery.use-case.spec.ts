import { StartDeliveryUseCase } from './start-delivery.use-case';
import { StartDeliveryCommand } from './start-delivery.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryStartedEvent } from '../../../domain/events/delivery-started.event';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockOrderDeliveryWriter,
    createMockCourierAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('StartDeliveryUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let orderWriter: ReturnType<typeof createMockOrderDeliveryWriter>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: StartDeliveryUseCase;

    const command = () =>
        StartDeliveryCommand.create({ currentUserId: TEST_COURIER_USER_ID, orderId: TEST_ORDER_ID });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        orderWriter = createMockOrderDeliveryWriter();
        courierAccessReader = createMockCourierAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new StartDeliveryUseCase(orderReader, orderWriter, courierAccessReader, eventPublisher);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('throws DeliveryAccessDeniedError when order is not PICKED_UP', async () => {
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('calls startDelivering and publishes event on success', async () => {
        const resultView = buildOrderDeliveryView({ status: OrderStatus.DELIVERING });
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.PICKED_UP }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderWriter.startDelivering.mockResolvedValue(resultView);

        const result = await useCase.execute(command());

        expect(orderWriter.startDelivering).toHaveBeenCalledWith(TEST_ORDER_ID, TEST_COURIER_USER_ID);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryStartedEvent)]),
        );
        expect(result).toBe(resultView);
    });
});
