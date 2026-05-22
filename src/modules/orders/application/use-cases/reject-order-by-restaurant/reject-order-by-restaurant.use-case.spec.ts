import { RejectOrderByRestaurantUseCase } from './reject-order-by-restaurant.use-case';
import { RejectOrderByRestaurantCommand } from './reject-order-by-restaurant.command';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { InvalidOrderStatusTransitionError } from '../../../domain/errors/invalid-order-status-transition.error';
import { InvalidOrderItemsError } from '../../../domain/errors/invalid-order-items.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderRejectedByRestaurantEvent } from '../../../domain/events/order-rejected-by-restaurant.event';
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

describe('RejectOrderByRestaurantUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RejectOrderByRestaurantUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new RejectOrderByRestaurantUseCase(orderRepository, restaurantAccessReader, eventPublisher);
        orderRepository.saveWithHistory.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (reason = 'Out of stock') =>
        RejectOrderByRestaurantCommand.create({
            currentUserId: TEST_USER_ID,
            orderId: TEST_ORDER_ID,
            reason,
        });

    it('throws InvalidOrderItemsError when reason is empty', async () => {
        await expect(useCase.execute(command(''))).rejects.toBeInstanceOf(InvalidOrderItemsError);
    });

    it('throws OrderNotFoundError when order does not exist', async () => {
        orderRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderRestaurantAccessDeniedError when user cannot manage restaurant', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderRestaurantAccessDeniedError);
    });

    it('throws InvalidOrderStatusTransitionError when order is not CREATED', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.PREPARING }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidOrderStatusTransitionError);
    });

    it('rejects CREATED order with reason', async () => {
        // Arrange
        const order = buildOrder({ status: OrderStatus.CREATED });
        orderRepository.findById.mockResolvedValue(order);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        // Act
        await useCase.execute(command('Out of stock'));

        // Assert
        expect(order.status).toBe(OrderStatus.REJECTED_BY_RESTAURANT);
        expect(order.cancellationReason).toBe('Out of stock');
    });

    it('publishes OrderRejectedByRestaurantEvent', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderRejectedByRestaurantEvent)]),
        );
    });
});
