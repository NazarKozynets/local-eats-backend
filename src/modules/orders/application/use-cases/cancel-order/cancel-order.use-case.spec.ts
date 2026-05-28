import { CancelOrderUseCase } from './cancel-order.use-case';
import { CancelOrderCommand } from './cancel-order.command';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderAccessDeniedError } from '../../../domain/errors/order-access-denied.error';
import { InvalidOrderCancellationError } from '../../../domain/errors/invalid-order-cancellation.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderCancelledEvent } from '../../../domain/events/order-cancelled.event';
import {
    TEST_USER_ID,
    TEST_CUSTOMER_ID,
    TEST_ORDER_ID,
    TEST_OTHER_USER_ID,
    buildOrder,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockCustomerOrderReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';

describe('CancelOrderUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let customerOrderReader: ReturnType<typeof createMockCustomerOrderReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CancelOrderUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        customerOrderReader = createMockCustomerOrderReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CancelOrderUseCase(orderRepository, customerOrderReader, eventPublisher);
        orderRepository.saveWithHistory.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
        customerOrderReader.getProfileByUserId.mockImplementation(async (userId: string) => ({
            id: userId,
            userId,
        }));
    });

    const command = (userId = TEST_USER_ID, reason: string | null = 'Changed my mind') =>
        CancelOrderCommand.create({ currentUserId: userId, orderId: TEST_ORDER_ID, reason });

    it('throws OrderCustomerProfileNotFoundError when profile does not exist', async () => {
        customerOrderReader.getProfileByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderCustomerProfileNotFoundError);
    });

    it('throws OrderNotFoundError when order does not exist', async () => {
        orderRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderAccessDeniedError when user is not the order owner', async () => {
        orderRepository.findById.mockResolvedValue(
            buildOrder({ customerId: UUID.create(TEST_CUSTOMER_ID) }),
        );

        await expect(useCase.execute(command(TEST_OTHER_USER_ID))).rejects.toBeInstanceOf(OrderAccessDeniedError);
    });

    it('throws InvalidOrderCancellationError when order is not CREATED', async () => {
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_USER_ID, userId: TEST_USER_ID });
        orderRepository.findById.mockResolvedValue(
            buildOrder({ customerId: UUID.create(TEST_USER_ID), status: OrderStatus.ACCEPTED_BY_RESTAURANT }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidOrderCancellationError);
    });

    it('cancels CREATED order and sets cancelledAt and reason', async () => {
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_USER_ID, userId: TEST_USER_ID });
        const order = buildOrder({ customerId: UUID.create(TEST_USER_ID), status: OrderStatus.CREATED });
        orderRepository.findById.mockResolvedValue(order);

        await useCase.execute(command(TEST_USER_ID, 'Changed my mind'));

        expect(order.status).toBe(OrderStatus.CANCELLED);
        expect(order.cancelledAt).not.toBeNull();
        expect(order.cancellationReason).toBe('Changed my mind');
        expect(orderRepository.saveWithHistory).toHaveBeenCalledWith(
            order,
            expect.objectContaining({ status: OrderStatus.CANCELLED, comment: 'Changed my mind' }),
        );
    });

    it('cancels without reason when reason is null', async () => {
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_USER_ID, userId: TEST_USER_ID });
        const order = buildOrder({ customerId: UUID.create(TEST_USER_ID), status: OrderStatus.CREATED });
        orderRepository.findById.mockResolvedValue(order);

        await useCase.execute(command(TEST_USER_ID, null));

        expect(order.status).toBe(OrderStatus.CANCELLED);
        expect(order.cancellationReason).toBeNull();
    });

    it('publishes OrderCancelledEvent', async () => {
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_USER_ID, userId: TEST_USER_ID });
        orderRepository.findById.mockResolvedValue(
            buildOrder({ customerId: UUID.create(TEST_USER_ID), status: OrderStatus.CREATED }),
        );

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderCancelledEvent)]),
        );
    });
});
