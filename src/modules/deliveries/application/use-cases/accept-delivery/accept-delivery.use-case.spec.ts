import { AcceptDeliveryUseCase } from './accept-delivery.use-case';
import { AcceptDeliveryCommand } from './accept-delivery.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryAcceptedEvent } from '../../../domain/events/delivery-accepted.event';
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
    createMockCourierAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('AcceptDeliveryUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: AcceptDeliveryUseCase;

    const command = () =>
        AcceptDeliveryCommand.create({ currentUserId: TEST_COURIER_USER_ID, orderId: TEST_ORDER_ID });

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        courierAccessReader = createMockCourierAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new AcceptDeliveryUseCase(orderReader, courierAccessReader, eventPublisher);
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

    it('throws DeliveryAccessDeniedError when courier is not assigned to this order', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ courierId: 'other-courier-id' }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('throws DeliveryAccessDeniedError when order is not ASSIGNED_TO_COURIER', async () => {
        orderReader.findById.mockResolvedValue(
            buildOrderDeliveryView({ status: OrderStatus.PICKED_UP }),
        );
        courierAccessReader.findByUserId.mockResolvedValue(
            buildCourierAccessView({ courierProfileId: TEST_COURIER_PROFILE_ID }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });

    it('publishes DeliveryAcceptedEvent and returns order on success', async () => {
        const order = buildOrderDeliveryView({ status: OrderStatus.ASSIGNED_TO_COURIER });
        orderReader.findById.mockResolvedValue(order);
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());

        const result = await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(DeliveryAcceptedEvent)]),
        );
        expect(result).toBe(order);
    });
});
