import { DeleteMenuCategoryUseCase } from './delete-menu-category.use-case';
import { DeleteMenuCategoryCommand } from './delete-menu-category.command';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryHasItemsError } from '../../../domain/errors/menu-category-has-items.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuCategoryDeletedEvent } from '../../../domain/events/menu-category-deleted.event';
import {
    TEST_USER_ID,
    TEST_CATEGORY_ID,
    buildMenuCategory,
} from '../../../__tests__/_helpers/builders';
import {
    createMockMenuCategoryRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
    createMockCacheService,
} from '../../../__tests__/_helpers/mocks';

describe('DeleteMenuCategoryUseCase', () => {
    let menuCategoryRepository: ReturnType<typeof createMockMenuCategoryRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: DeleteMenuCategoryUseCase;

    beforeEach(() => {
        menuCategoryRepository = createMockMenuCategoryRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new DeleteMenuCategoryUseCase(
            menuCategoryRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuCategoryRepository.delete.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        DeleteMenuCategoryCommand.create({
            currentUserId: TEST_USER_ID,
            categoryId: TEST_CATEGORY_ID,
        });

    it('throws MenuCategoryNotFoundError when category does not exist', async () => {
        menuCategoryRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(MenuCategoryNotFoundError);
    });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantCatalogAccessDeniedError);
    });

    it('throws MenuCategoryHasItemsError when category has items', async () => {
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.hasItems.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(MenuCategoryHasItemsError);
    });

    it('deletes category when it has no items', async () => {
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.hasItems.mockResolvedValue(false);

        await useCase.execute(command());

        expect(menuCategoryRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('publishes MenuCategoryDeletedEvent on success', async () => {
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.hasItems.mockResolvedValue(false);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuCategoryDeletedEvent)]),
        );
    });

    it('invalidates public catalog cache after successful deletion', async () => {
        const cacheService = createMockCacheService();
        cacheService.delete.mockResolvedValue(undefined);
        const useCaseWithCache = new DeleteMenuCategoryUseCase(
            menuCategoryRepository,
            restaurantAccessReader,
            eventPublisher,
            cacheService,
        );
        const category = buildMenuCategory();
        menuCategoryRepository.findById.mockResolvedValue(category);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.hasItems.mockResolvedValue(false);

        await useCaseWithCache.execute(command());

        expect(cacheService.delete).toHaveBeenCalledWith(`catalog:public:${category.restaurantId.value}`);
    });
});
