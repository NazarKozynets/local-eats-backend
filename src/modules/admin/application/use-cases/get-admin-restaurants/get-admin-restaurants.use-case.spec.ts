import { GetAdminRestaurantsUseCase } from './get-admin-restaurants.use-case';
import { createMockAdminRestaurantReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminRestaurant } from '../../../__tests__/_helpers/builders';

describe('GetAdminRestaurantsUseCase', () => {
    let restaurantReader: ReturnType<typeof createMockAdminRestaurantReader>;
    let useCase: GetAdminRestaurantsUseCase;

    beforeEach(() => {
        restaurantReader = createMockAdminRestaurantReader();
        useCase = new GetAdminRestaurantsUseCase(restaurantReader);
    });

    it('returns restaurants from reader with filters', async () => {
        const restaurants = [buildAdminRestaurant()];
        restaurantReader.findMany.mockResolvedValue(restaurants);
        const command = { page: 1, limit: 20, status: 'ACTIVE' };

        const result = await useCase.execute(command);

        expect(result).toEqual(restaurants);
        expect(restaurantReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no restaurants match', async () => {
        restaurantReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ verificationStatus: 'PENDING' });

        expect(result).toEqual([]);
    });
});
