import { GetMyRestaurantsUseCase } from './get-my-restaurants.use-case';
import { RestaurantStaffRole } from '../../../domain/enums/restaurant-staff-role.enum';
import {
    buildRestaurant,
    buildStaff,
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    TEST_STAFF_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockRestaurantStaffRepository,
} from '../../../__tests__/_helpers/mocks';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';

describe('GetMyRestaurantsUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let useCase: GetMyRestaurantsUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        useCase = new GetMyRestaurantsUseCase(restaurantRepository, staffRepository);
    });

    const command = () => ({ currentUserId: TEST_USER_ID });

    it('returns empty array when user has no staff entries', async () => {
        staffRepository.findManyByUserId.mockResolvedValue([]);

        const result = await useCase.execute(command());

        expect(result).toEqual([]);
    });

    it('returns restaurant summaries for each staff entry', async () => {
        const staff = buildStaff({ role: RestaurantStaffRole.OWNER });
        const restaurant = buildRestaurant();
        staffRepository.findManyByUserId.mockResolvedValue([staff]);
        restaurantRepository.findById.mockResolvedValue(restaurant);

        const result = await useCase.execute(command());

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(TEST_RESTAURANT_ID);
        expect(result[0].name).toBe('Test Restaurant');
        expect(result[0].staffRole).toBe(RestaurantStaffRole.OWNER);
    });

    it('skips staff entries whose restaurant no longer exists', async () => {
        const staff = buildStaff();
        staffRepository.findManyByUserId.mockResolvedValue([staff]);
        restaurantRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute(command());

        expect(result).toHaveLength(0);
    });

    it('returns correct fields including city and verificationStatus', async () => {
        const staff = buildStaff({ role: RestaurantStaffRole.MANAGER });
        const restaurant = buildRestaurant({ city: 'Lviv' });
        staffRepository.findManyByUserId.mockResolvedValue([staff]);
        restaurantRepository.findById.mockResolvedValue(restaurant);

        const result = await useCase.execute(command());

        expect(result[0].city).toBe('Lviv');
        expect(result[0].staffRole).toBe(RestaurantStaffRole.MANAGER);
        expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('queries restaurant repository with staff restaurantId', async () => {
        const restaurantId = UUID.create(TEST_RESTAURANT_ID);
        const staff = buildStaff({ restaurantId });
        staffRepository.findManyByUserId.mockResolvedValue([staff]);
        restaurantRepository.findById.mockResolvedValue(null);

        await useCase.execute(command());

        expect(restaurantRepository.findById).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_RESTAURANT_ID }),
        );
    });
});
