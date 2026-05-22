import { GetOrderDetailsUseCase } from './get-order-details.use-case';
import { GetOrderDetailsCommand } from './get-order-details.command';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderAccessDeniedError } from '../../../domain/errors/order-access-denied.error';
import {
    TEST_USER_ID,
    TEST_ORDER_ID,
    TEST_CUSTOMER_ID,
    TEST_RESTAURANT_ID,
    TEST_OTHER_USER_ID,
    buildOrder,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockOrderStatusHistoryRepository,
    createMockRestaurantAccessReader,
    createMockCustomerOrderReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetOrderDetailsUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let historyRepository: ReturnType<typeof createMockOrderStatusHistoryRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let customerOrderReader: ReturnType<typeof createMockCustomerOrderReader>;
    let useCase: GetOrderDetailsUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        historyRepository = createMockOrderStatusHistoryRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        customerOrderReader = createMockCustomerOrderReader();

        useCase = new GetOrderDetailsUseCase(
            orderRepository,
            historyRepository,
            restaurantAccessReader,
            customerOrderReader,
        );

        historyRepository.findManyByOrderId.mockResolvedValue([]);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);
    });

    const command = (userId = TEST_USER_ID) =>
        GetOrderDetailsCommand.create({ currentUserId: userId, orderId: TEST_ORDER_ID });

    it('throws OrderNotFoundError when order does not exist', async () => {
        orderRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotFoundError);
    });

    it('customer can get their own order', async () => {
        const order = buildOrder();
        orderRepository.findById.mockResolvedValue(order);
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_CUSTOMER_ID, userId: TEST_USER_ID });

        const result = await useCase.execute(command(TEST_USER_ID));

        expect(result.id).toBe(TEST_ORDER_ID);
    });

    it('restaurant staff can get order for their restaurant', async () => {
        const order = buildOrder();
        orderRepository.findById.mockResolvedValue(order);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        const result = await useCase.execute(command(TEST_OTHER_USER_ID));

        expect(result.id).toBe(TEST_ORDER_ID);
        expect(restaurantAccessReader.canManageRestaurant).toHaveBeenCalledWith(
            TEST_OTHER_USER_ID,
            TEST_RESTAURANT_ID,
        );
    });

    it('unrelated user cannot get order', async () => {
        const order = buildOrder();
        orderRepository.findById.mockResolvedValue(order);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command(TEST_OTHER_USER_ID))).rejects.toBeInstanceOf(OrderAccessDeniedError);
    });

    it('includes status history in result', async () => {
        const order = buildOrder();
        orderRepository.findById.mockResolvedValue(order);
        customerOrderReader.getProfileByUserId.mockResolvedValue({ id: TEST_CUSTOMER_ID, userId: TEST_USER_ID });

        const result = await useCase.execute(command());

        expect(Array.isArray(result.statusHistory)).toBe(true);
    });
});
