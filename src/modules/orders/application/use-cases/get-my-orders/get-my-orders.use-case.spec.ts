import { GetMyOrdersUseCase } from './get-my-orders.use-case';
import { GetMyOrdersCommand } from './get-my-orders.command';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';
import {
    TEST_USER_ID,
    TEST_CUSTOMER_ID,
    buildOrder,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockCustomerOrderReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetMyOrdersUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let customerReader: ReturnType<typeof createMockCustomerOrderReader>;
    let useCase: GetMyOrdersUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        customerReader = createMockCustomerOrderReader();
        useCase = new GetMyOrdersUseCase(orderRepository, customerReader);
    });

    const command = () => GetMyOrdersCommand.create({ currentUserId: TEST_USER_ID });

    it('throws OrderCustomerProfileNotFoundError when profile does not exist', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderCustomerProfileNotFoundError);
    });

    it('returns only current customer orders', async () => {
        // Arrange
        customerReader.getProfileByUserId.mockResolvedValue({ id: TEST_CUSTOMER_ID, userId: TEST_USER_ID });
        const orders = [buildOrder(), buildOrder()];
        orderRepository.findManyByCustomerId.mockResolvedValue(orders);

        // Act
        const result = await useCase.execute(command());

        // Assert
        expect(result).toHaveLength(2);
        expect(orderRepository.findManyByCustomerId).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_CUSTOMER_ID }),
        );
    });
});
