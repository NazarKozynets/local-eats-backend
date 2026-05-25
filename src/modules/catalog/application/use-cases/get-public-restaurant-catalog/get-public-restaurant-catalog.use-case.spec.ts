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
    createMockCacheService,
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
        // Arrange
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(false);

        // Act & Assert
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            RestaurantNotAvailableForPublicCatalogError,
        );
    });

    it('returns public catalog for active restaurant', async () => {
        // Arrange
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        // Act
        const result = await useCase.execute(command());

        // Assert
        expect(result).toEqual(mockPublicCatalog);
    });

    it('excludes HIDDEN items (only AVAILABLE and UNAVAILABLE visible)', async () => {
        // Arrange
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        // Act
        const result = await useCase.execute(command());

        // Assert
        const allItems = [
            ...result.categories.flatMap((c) => c.items),
            ...result.uncategorizedItems,
        ];
        expect(allItems.every((i) => i.status !== MenuItemStatus.HIDDEN)).toBe(true);
    });

    it('delegates to catalogReader.getPublicCatalog', async () => {
        // Arrange
        restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
        catalogReader.getPublicCatalog.mockResolvedValue(mockPublicCatalog);

        // Act
        await useCase.execute(command());

        // Assert
        expect(catalogReader.getPublicCatalog).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
    });

    describe('with cache service', () => {
        let cacheService: ReturnType<typeof createMockCacheService>;

        beforeEach(() => {
            cacheService = createMockCacheService();
            useCase = new GetPublicRestaurantCatalogUseCase(
                catalogReader,
                restaurantAccessReader,
                cacheService,
            );
        });

        it('uses cache remember with correct key and TTL', async () => {
            // Arrange
            restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
            cacheService.remember.mockResolvedValue(mockPublicCatalog);

            // Act
            await useCase.execute(command());

            // Assert
            expect(cacheService.remember).toHaveBeenCalledWith(
                `catalog:public:${TEST_RESTAURANT_ID}`,
                60,
                expect.any(Function),
            );
        });

        it('returns cached result when cache hits', async () => {
            // Arrange
            restaurantAccessReader.existsActiveRestaurant.mockResolvedValue(true);
            cacheService.remember.mockResolvedValue(mockPublicCatalog);

            // Act
            const result = await useCase.execute(command());

            // Assert
            expect(result).toEqual(mockPublicCatalog);
            expect(catalogReader.getPublicCatalog).not.toHaveBeenCalled();
        });
    });
});
