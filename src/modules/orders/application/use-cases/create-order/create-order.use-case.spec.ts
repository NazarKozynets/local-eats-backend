import { CreateOrderUseCase } from './create-order.use-case';
import { CreateOrderCommand } from './create-order.command';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { OrderCreatedEvent } from '../../../domain/events/order-created.event';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';
import { OrderDeliveryAddressNotFoundError } from '../../../domain/errors/order-delivery-address-not-found.error';
import { OrderDeliveryAddressAccessDeniedError } from '../../../domain/errors/order-delivery-address-access-denied.error';
import { RestaurantNotAvailableForOrderError } from '../../../domain/errors/restaurant-not-available-for-order.error';
import { EmptyOrderError } from '../../../domain/errors/empty-order.error';
import { InvalidOrderQuantityError } from '../../../domain/errors/invalid-order-quantity.error';
import { InvalidOrderItemsError } from '../../../domain/errors/invalid-order-items.error';
import { OrderItemNotAvailableError } from '../../../domain/errors/order-item-not-available.error';
import { OrderItemRestaurantMismatchError } from '../../../domain/errors/order-item-restaurant-mismatch.error';
import {
    TEST_USER_ID,
    TEST_CUSTOMER_ID,
    TEST_RESTAURANT_ID,
    TEST_ITEM_ID,
    TEST_ADDRESS_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderRepository,
    createMockCustomerOrderReader,
    createMockCatalogOrderReader,
    createMockRestaurantOrderReader,
    createMockRestaurantAccessReader,
    createMockOrderPublicCodeGenerator,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

const MOCK_PROFILE = { id: TEST_CUSTOMER_ID, userId: TEST_USER_ID };
const MOCK_ADDRESS = {
    id: TEST_ADDRESS_ID,
    customerId: TEST_CUSTOMER_ID,
    label: null,
    city: 'Kyiv',
    street: 'Main St',
    building: '1',
    apartment: null,
    entrance: null,
    floor: null,
    comment: null,
};
const MOCK_CATALOG_ITEM = {
    id: TEST_ITEM_ID,
    restaurantId: TEST_RESTAURANT_ID,
    name: 'Margherita',
    price: 14.99,
    status: 'AVAILABLE',
};

describe('CreateOrderUseCase', () => {
    let orderRepository: ReturnType<typeof createMockOrderRepository>;
    let customerReader: ReturnType<typeof createMockCustomerOrderReader>;
    let catalogReader: ReturnType<typeof createMockCatalogOrderReader>;
    let restaurantOrderReader: ReturnType<typeof createMockRestaurantOrderReader>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let codeGenerator: ReturnType<typeof createMockOrderPublicCodeGenerator>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateOrderUseCase;

    beforeEach(() => {
        orderRepository = createMockOrderRepository();
        customerReader = createMockCustomerOrderReader();
        catalogReader = createMockCatalogOrderReader();
        restaurantOrderReader = createMockRestaurantOrderReader();
        restaurantAccessReader = createMockRestaurantAccessReader();
        codeGenerator = createMockOrderPublicCodeGenerator();
        eventPublisher = createMockEventPublisher();

        useCase = new CreateOrderUseCase(
            orderRepository,
            customerReader,
            catalogReader,
            restaurantOrderReader,
            restaurantAccessReader,
            codeGenerator,
            eventPublisher,
        );

        orderRepository.createWithItems.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
        restaurantOrderReader.getDeliverySettings.mockResolvedValue({ deliveryFee: 0, minOrderAmount: 0 });
    });

    const command = () =>
        CreateOrderCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            customerAddressId: TEST_ADDRESS_ID,
            paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            items: [{ menuItemId: TEST_ITEM_ID, quantity: 2 }],
        });

    it('fails when items array is empty', async () => {
        const cmd = CreateOrderCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            customerAddressId: TEST_ADDRESS_ID,
            paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            items: [],
        });

        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(EmptyOrderError);
    });

    it('fails when quantity is invalid', async () => {
        const cmd = CreateOrderCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            customerAddressId: TEST_ADDRESS_ID,
            paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
            items: [{ menuItemId: TEST_ITEM_ID, quantity: 0 }],
        });

        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(InvalidOrderQuantityError);
    });

    it('fails when customer profile does not exist', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderCustomerProfileNotFoundError);
    });

    it('fails when delivery address is not found', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderDeliveryAddressNotFoundError);
    });

    it('fails when delivery address does not belong to customer', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue({ ...MOCK_ADDRESS, customerId: 'other-customer' });

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderDeliveryAddressAccessDeniedError);
    });

    it('fails when restaurant is not active', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotAvailableForOrderError);
    });

    it('fails when menu item is not found in catalog', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidOrderItemsError);
    });

    it('fails when menu item belongs to a different restaurant', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([
            { ...MOCK_CATALOG_ITEM, restaurantId: 'other-restaurant' },
        ]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderItemRestaurantMismatchError);
    });

    it('fails when menu item is UNAVAILABLE', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([{ ...MOCK_CATALOG_ITEM, status: 'UNAVAILABLE' }]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderItemNotAvailableError);
    });

    it('fails when menu item is HIDDEN', async () => {
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([{ ...MOCK_CATALOG_ITEM, status: 'HIDDEN' }]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderItemNotAvailableError);
    });

    it('creates order with item snapshots and correct totals', async () => {
        // Arrange
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([MOCK_CATALOG_ITEM]);
        restaurantOrderReader.getDeliverySettings.mockResolvedValue({ deliveryFee: 5, minOrderAmount: 0 });

        // Act
        await useCase.execute(command());

        // Assert
        expect(orderRepository.createWithItems).toHaveBeenCalledTimes(1);
        const [savedOrder] = orderRepository.createWithItems.mock.calls[0];

        expect(savedOrder.items).toHaveLength(1);
        expect(savedOrder.items[0].nameSnapshot).toBe('Margherita');
        expect(savedOrder.items[0].priceSnapshot).toBe(14.99);
        expect(savedOrder.items[0].quantity).toBe(2);
        expect(savedOrder.items[0].totalPriceSnapshot).toBeCloseTo(29.98, 2);
        expect(savedOrder.subtotalPrice).toBeCloseTo(29.98, 2);
        expect(savedOrder.deliveryFee).toBe(5);
        expect(savedOrder.totalPrice).toBeCloseTo(34.98, 2);
    });

    it('publishes OrderCreatedEvent on success', async () => {
        // Arrange
        customerReader.getProfileByUserId.mockResolvedValue(MOCK_PROFILE);
        customerReader.getAddress.mockResolvedValue(MOCK_ADDRESS);
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getItemsByIds.mockResolvedValue([MOCK_CATALOG_ITEM]);

        // Act
        await useCase.execute(command());

        // Assert
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(OrderCreatedEvent)]),
        );
    });
});
