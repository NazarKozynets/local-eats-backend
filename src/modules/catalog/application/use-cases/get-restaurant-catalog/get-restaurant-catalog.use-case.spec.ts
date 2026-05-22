import { GetRestaurantCatalogUseCase } from './get-restaurant-catalog.use-case';
import { GetRestaurantCatalogCommand } from './get-restaurant-catalog.command';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';
import type { CatalogReadModel } from '../../ports/catalog-reader.port';
import {
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    TEST_CATEGORY_ID,
    TEST_ITEM_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCatalogReader,
    createMockRestaurantAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetRestaurantCatalogUseCase', () => {
    let catalogReader: ReturnType<typeof createMockCatalogReader>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let useCase: GetRestaurantCatalogUseCase;

    const mockCatalog: CatalogReadModel = {
        restaurantId: TEST_RESTAURANT_ID,
        categories: [
            {
                id: TEST_CATEGORY_ID,
                restaurantId: TEST_RESTAURANT_ID,
                name: 'Pizza',
                position: 0,
                isActive: true,
                items: [
                    {
                        id: TEST_ITEM_ID,
                        restaurantId: TEST_RESTAURANT_ID,
                        categoryId: TEST_CATEGORY_ID,
                        name: 'Margherita',
                        description: null,
                        imageUrl: null,
                        price: 14.99,
                        status: MenuItemStatus.HIDDEN,
                        weightGrams: null,
                        estimatedCookTime: null,
                        isPopular: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        uncategorizedItems: [],
    };

    beforeEach(() => {
        catalogReader = createMockCatalogReader();
        restaurantAccessReader = createMockRestaurantAccessReader();
        useCase = new GetRestaurantCatalogUseCase(catalogReader, restaurantAccessReader);
    });

    const command = () =>
        GetRestaurantCatalogCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
        });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantCatalogAccessDeniedError);
    });

    it('returns full manager catalog including hidden items', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        catalogReader.getManagerCatalog.mockResolvedValue(mockCatalog);

        const result = await useCase.execute(command());

        expect(result).toEqual(mockCatalog);
        expect(result.categories[0].items[0].status).toBe(MenuItemStatus.HIDDEN);
    });

    it('delegates to catalogReader.getManagerCatalog', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        catalogReader.getManagerCatalog.mockResolvedValue(mockCatalog);

        await useCase.execute(command());

        expect(catalogReader.getManagerCatalog).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
    });
});
