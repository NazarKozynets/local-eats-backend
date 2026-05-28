import { MarkOrderPickedUpUseCase } from './mark-order-picked-up.use-case';
import { MarkOrderPickedUpCommand } from './mark-order-picked-up.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { OrderPickedUpEvent } from '../../../domain/events/order-picked-up.event';
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
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('MarkOrderPickedUpUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let orderWriter: ReturnType<typeof createMockOrderDeliveryWriter>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkOrderPickedUpUseCase;

    const command = () =>
        MarkOrderPickedUpCommand.create({ currentUserId: TEST_COURIER_USER_ID, orderId: TEST_ORDER_ID });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        orderWriter = createMockOrderDeliveryWriter();
        courierAccessReader = createMockCourierAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkOrderPickedUpUseCase(orderReader, orderWriter, courierAccessReader, eventPublisher);
        eventPublisher.publishAll.mockResolvedValue(undefined);
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
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView({ status: OrderStatus.PICKED_UP }));
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('calls markPickedUp and publishes event on success', async () => {
        const now = new Date();
        const resultView = buildOrderDeliveryView({ status: OrderStatus.PICKED_UP, pickedUpAt: now });
        orderReader.findById.mockResolvedValue(buildOrderDeliveryView());
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        orderWriter.markPickedUp.mockResolvedValue(resultView);

        const result = await useCase.execute(command());

        expect(orderWriter.markPickedUp).toHaveBeenCalledWith(TEST_ORDER_ID, TEST_COURIER_USER_ID);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderPickedUpEvent)]),
        );
        expect(result).toBe(resultView);
    });
});
