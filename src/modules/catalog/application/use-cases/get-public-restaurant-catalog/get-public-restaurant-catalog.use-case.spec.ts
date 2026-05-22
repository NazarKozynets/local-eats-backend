import { GetPublicRestaurantCatalogUseCase } from './get-public-restaurant-catalog.use-case';
import { GetPublicRestaurantCatalogCommand } from './get-public-restaurant-catalog.command';
import { RestaurantNotAvailableForPublicCatalogError } from '../../../domain/errors/restaurant-not-available-for-public-catalog.error';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';
import type { CatalogReadModel } from '../../ports/catalog-reader.port';
import {
    TEST_RESTAURANT_ID,
    TEST_CATEGORY_ID,
    TEST_ITEM_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCatalogReader,
    createMockRestaurantAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('GetPublicRestaurantCatalogUseCase', () => {
    let catalogReader: ReturnType<typeof createMockCatalogReader>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let useCase: GetPublicRestaurantCatalogUseCase;

    const mockPublicCatalog: CatalogReadModel = {
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
                        status: MenuItemStatus.AVAILABLE,
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
        useCase = new GetPublicRestaurantCatalogUseCase(catalogReader, restaurantAccessReader);
    });

    const command = () =>
        GetPublicRestaurantCatalogCommand.create({ restaurantId: TEST_RESTAURANT_ID });

    it('throws RestaurantNotAvailableForPublicCatalogError when restaurant is not active', async () => {
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            RestaurantNotAvailableForPublicCatalogError,
        );
    });

    it('returns public catalog for active restaurant', async () => {
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        const result = await useCase.execute(command());

        expect(result).toEqual(mockPublicCatalog);
    });

    it('excludes HIDDEN items (only AVAILABLE and UNAVAILABLE visible)', async () => {
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        const result = await useCase.execute(command());

        const allItems = [
            ...result.categories.flatMap((c) => c.items),
            ...result.uncategorizedItems,
        ];
        expect(allItems.every((i) => i.status !== MenuItemStatus.HIDDEN)).toBe(true);
    });

    it('delegates to catalogReader.getPublicCatalog', async () => {
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        await useCase.execute(command());

        expect(catalogReader.getPublicCatalog).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
    });
});
