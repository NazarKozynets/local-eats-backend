import { GetRestaurantOrdersUseCase } from './get-restaurant-orders.use-case';
import { GetRestaurantOrdersCommand } from './get-restaurant-orders.command';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import {
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    buildOrder,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockRestaurantAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetRestaurantOrdersUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let useCase: GetRestaurantOrdersUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        useCase = new GetRestaurantOrdersUseCase(orderRepository, restaurantAccessReader);
    });

    const command = (status?: OrderStatus) =>
        GetRestaurantOrdersCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            status,
        });

    it('throws OrderRestaurantAccessDeniedError when user cannot manage restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderRestaurantAccessDeniedError);
    });

    it('returns orders for restaurant when user can manage it', async () => {
        // Arrange
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        const orders = [buildOrder(), buildOrder()];
        orderRepository.findManyByRestaurantId.mockResolvedValue(orders);

        // Act
        const result = await useCase.execute(command());

        // Assert
        expect(result).toHaveLength(2);
        expect(orderRepository.findManyByRestaurantId).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_RESTAURANT_ID }),
            undefined,
        );
    });

    it('passes status filter to repository', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        orderRepository.findManyByRestaurantId.mockResolvedValue([]);

        await useCase.execute(command(OrderStatus.CREATED));

        expect(orderRepository.findManyByRestaurantId).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_RESTAURANT_ID }),
            { status: OrderStatus.CREATED },
        );
    });
});
