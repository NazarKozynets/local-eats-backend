import { GetRestaurantByIdUseCase } from './get-restaurant-by-id.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { buildRestaurant, TEST_RESTAURANT_ID } from '../../../__tests__/_helpers/builders';
import { createMockRestaurantRepository } from '../../../__tests__/_helpers/mocks';

describe('GetRestaurantByIdUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let useCase: GetRestaurantByIdUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        useCase = new GetRestaurantByIdUseCase(restaurantRepository);
    });

    const command = () => ({ restaurantId: TEST_RESTAURANT_ID });

    it('throws RestaurantNotFoundError when restaurant does not exist', async () => {
        restaurantRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotFoundError);
    });

    it('returns all restaurant fields on success', async () => {
        const restaurant = buildRestaurant({ city: 'Odesa' });
        restaurantRepository.findById.mockResolvedValue(restaurant);

        const result = await useCase.execute(command());

        expect(result.id).toBe(TEST_RESTAURANT_ID);
        expect(result.name).toBe('Test Restaurant');
        expect(result.city).toBe('Odesa');
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('returns null for optional fields not set', async () => {
        const restaurant = buildRestaurant({ description: null, phone: null, email: null });
        restaurantRepository.findById.mockResolvedValue(restaurant);

        const result = await useCase.execute(command());

        expect(result.description).toBeNull();
        expect(result.phone).toBeNull();
        expect(result.email).toBeNull();
        expect(result.verificationRejectedReason).toBeNull();
        expect(result.verifiedAt).toBeNull();
    });
});
