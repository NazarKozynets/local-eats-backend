import { CreateMenuItemUseCase } from './create-menu-item.use-case';
import { CreateMenuItemCommand } from './create-menu-item.command';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryAccessDeniedError } from '../../../domain/errors/menu-category-access-denied.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { InvalidMenuItemNameError } from '../../../domain/errors/invalid-menu-item-name.error';
import { InvalidMenuItemPriceError } from '../../../domain/errors/invalid-menu-item-price.error';
import { MenuItemCreatedEvent } from '../../../domain/events/menu-item-created.event';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    TEST_CATEGORY_ID,
    TEST_OTHER_RESTAURANT_ID,
    buildMenuCategory,
} from '../../../__tests__/_helpers/builders';
import {
    createMockMenuCategoryRepository,
    createMockMenuItemRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
    createMockCacheService,
} from '../../../__tests__/_helpers/mocks';

describe('CreateMenuItemUseCase', () => {
    let menuCategoryRepository: ReturnType<typeof createMockMenuCategoryRepository>;
    let menuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateMenuItemUseCase;

    beforeEach(() => {
        menuCategoryRepository = createMockMenuCategoryRepository();
        menuItemRepository = createMockMenuItemRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateMenuItemUseCase(
            menuCategoryRepository,
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuItemRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides: Partial<Parameters<typeof CreateMenuItemCommand.create>[0]> = {}) =>
        CreateMenuItemCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            name: 'Margherita Pizza',
            price: 14.99,
            ...overrides,
        });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantCatalogAccessDeniedError);
    });

    it('throws MenuCategoryNotFoundError when categoryId is provided but category not found', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(command({ categoryId: TEST_CATEGORY_ID })),
        ).rejects.toBeInstanceOf(MenuCategoryNotFoundError);
    });

    it('throws MenuCategoryAccessDeniedError when category belongs to another restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(
            buildMenuCategory({ restaurantId: UUID.create(TEST_OTHER_RESTAURANT_ID) }),
        );

        await expect(
            useCase.execute(command({ categoryId: TEST_CATEGORY_ID })),
        ).rejects.toBeInstanceOf(MenuCategoryAccessDeniedError);
    });

    it('throws InvalidMenuItemNameError for empty name', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command({ name: '  ' }))).rejects.toBeInstanceOf(InvalidMenuItemNameError);
    });

    it('throws InvalidMenuItemPriceError for negative price', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command({ price: -1 }))).rejects.toBeInstanceOf(InvalidMenuItemPriceError);
    });

    it('creates item without category when no categoryId provided', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(menuItemRepository.save).toHaveBeenCalledTimes(1);
    });

    it('creates item with valid category from same restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());

        await useCase.execute(command({ categoryId: TEST_CATEGORY_ID }));

        expect(menuItemRepository.save).toHaveBeenCalledTimes(1);
    });

    it('publishes MenuItemCreatedEvent on success', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuItemCreatedEvent)]),
        );
    });

    it('invalidates public catalog cache after successful creation', async () => {
        const cacheService = createMockCacheService();
        cacheService.delete.mockResolvedValue(undefined);
        const useCaseWithCache = new CreateMenuItemUseCase(
            menuCategoryRepository,
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
            cacheService,
        );
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCaseWithCache.execute(command());

        expect(cacheService.delete).toHaveBeenCalledWith(`catalog:public:${TEST_RESTAURANT_ID}`);
    });
});
