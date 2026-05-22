import { StartOrderPreparationUseCase } from './start-order-preparation.use-case';
import { StartOrderPreparationCommand } from './start-order-preparation.command';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { InvalidOrderStatusTransitionError } from '../../../domain/errors/invalid-order-status-transition.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderPreparationStartedEvent } from '../../../domain/events/order-preparation-started.event';
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

describe('StartOrderPreparationUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: StartOrderPreparationUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new StartOrderPreparationUseCase(orderRepository, restaurantAccessReader, eventPublisher);
        orderRepository.saveWithHistory.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        StartOrderPreparationCommand.create({ currentUserId: TEST_USER_ID, orderId: TEST_ORDER_ID });

    it('throws OrderNotFoundError when order does not exist', async () => {
        orderRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('throws OrderRestaurantAccessDeniedError when user cannot manage restaurant', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.ACCEPTED_BY_RESTAURANT }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderRestaurantAccessDeniedError);
    });

    it('throws InvalidOrderStatusTransitionError when order is not ACCEPTED_BY_RESTAURANT', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.CREATED }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidOrderStatusTransitionError);
    });

    it('sets order status to PREPARING', async () => {
        const order = buildOrder({ status: OrderStatus.ACCEPTED_BY_RESTAURANT });
        orderRepository.findById.mockResolvedValue(order);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(order.status).toBe(OrderStatus.PREPARING);
        expect(orderRepository.saveWithHistory).toHaveBeenCalledWith(
            order,
            expect.objectContaining({ status: OrderStatus.PREPARING }),
        );
    });

    it('publishes OrderPreparationStartedEvent', async () => {
        orderRepository.findById.mockResolvedValue(buildOrder({ status: OrderStatus.ACCEPTED_BY_RESTAURANT }));
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderPreparationStartedEvent)]),
        );
    });
});
