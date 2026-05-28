import { GetDeliveryDetailsUseCase } from './get-delivery-details.use-case';
import { GetDeliveryDetailsCommand } from './get-delivery-details.command';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import {
    buildOrderDeliveryView,
    buildCourierAccessView,
    TEST_ORDER_ID,
    TEST_COURIER_PROFILE_ID,
    TEST_COURIER_USER_ID,
    TEST_CUSTOMER_USER_ID,
    TEST_ADMIN_USER_ID,
    TEST_MANAGER_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockOrderDeliveryReader,
    createMockCourierAccessReader,
    createMockRestaurantAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetDeliveryDetailsUseCase', () => {
    let orderReader: ReturnType<typeof createMockOrderDeliveryReader>;
    let courierAccessReader: ReturnType<typeof createMockCourierAccessReader>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let useCase: GetDeliveryDetailsUseCase;

    beforeEach(() => {
        orderReader = createMockOrderDeliveryReader();
        courierAccessReader = createMockCourierAccessReader();
        restaurantAccessReader = createMockRestaurantAccessReader();
        useCase = new GetDeliveryDetailsUseCase(orderReader, courierAccessReader, restaurantAccessReader);
    });

    it('throws DeliveryNotFoundError when order does not exist', async () => {
        orderReader.findById.mockResolvedValue(null);
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: TEST_ADMIN_USER_ID,
            currentUserRole: UserRole.ADMIN,
            orderId: TEST_ORDER_ID,
        });
        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(DeliveryNotFoundError);
    });

    it('admin can always access delivery details', async () => {
        const order = buildOrderDeliveryView();
        orderReader.findById.mockResolvedValue(order);
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: TEST_ADMIN_USER_ID,
            currentUserRole: UserRole.ADMIN,
            orderId: TEST_ORDER_ID,
        });
        const result = await useCase.execute(cmd);
        expect(result).toBe(order);
        expect(courierAccessReader.findByUserId).not.toHaveBeenCalled();
    });

    it('customer can access their own order delivery', async () => {
        const order = buildOrderDeliveryView({ customerUserId: TEST_CUSTOMER_USER_ID });
        orderReader.findById.mockResolvedValue(order);
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: TEST_CUSTOMER_USER_ID,
            currentUserRole: UserRole.CUSTOMER,
            orderId: TEST_ORDER_ID,
        });
        const result = await useCase.execute(cmd);
        expect(result).toBe(order);
    });

    it('assigned courier can access delivery details', async () => {
        const order = buildOrderDeliveryView({ courierId: TEST_COURIER_PROFILE_ID });
        orderReader.findById.mockResolvedValue(order);
        courierAccessReader.findByUserId.mockResolvedValue(buildCourierAccessView());
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: TEST_COURIER_USER_ID,
            currentUserRole: UserRole.COURIER,
            orderId: TEST_ORDER_ID,
        });
        const result = await useCase.execute(cmd);
        expect(result).toBe(order);
    });

    it('restaurant manager can access delivery details', async () => {
        const order = buildOrderDeliveryView({ restaurantId: TEST_RESTAURANT_ID });
        orderReader.findById.mockResolvedValue(order);
        courierAccessReader.findByUserId.mockResolvedValue(null);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: TEST_MANAGER_USER_ID,
            currentUserRole: UserRole.RESTAURANT_MANAGER,
            orderId: TEST_ORDER_ID,
        });
        const result = await useCase.execute(cmd);
        expect(result).toBe(order);
    });

    it('throws DeliveryAccessDeniedError for unrelated user', async () => {
        const order = buildOrderDeliveryView({ customerUserId: 'other-user-id' });
        orderReader.findById.mockResolvedValue(order);
        courierAccessReader.findByUserId.mockResolvedValue(null);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);
        const cmd = GetDeliveryDetailsCommand.create({
            currentUserId: 'random-user-id',
            currentUserRole: UserRole.CUSTOMER,
            orderId: TEST_ORDER_ID,
        });
        await expect(useCase.execute(cmd)).rejects.toBeInstanceOf(DeliveryAccessDeniedError);
    });
});
