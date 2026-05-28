import { UpdateMenuCategoryUseCase } from './update-menu-category.use-case';
import { UpdateMenuCategoryCommand } from './update-menu-category.command';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuCategoryUpdatedEvent } from '../../../domain/events/menu-category-updated.event';
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

describe('UpdateMenuCategoryUseCase', () => {
    let menuCategoryRepository: ReturnType<typeof createMockMenuCategoryRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateMenuCategoryUseCase;

    beforeEach(() => {
        menuCategoryRepository = createMockMenuCategoryRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateMenuCategoryUseCase(
            menuCategoryRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuCategoryRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides = {}) =>
        UpdateMenuCategoryCommand.create({
            currentUserId: TEST_USER_ID,
            categoryId: TEST_CATEGORY_ID,
            ...overrides,
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

    it('updates category name when provided', async () => {
        const category = buildMenuCategory();
        menuCategoryRepository.findById.mockResolvedValue(category);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ name: 'Updated Name' }));

        expect(category.name.value).toBe('Updated Name');
        expect(menuCategoryRepository.save).toHaveBeenCalledWith(category);
    });

    it('updates category position when provided', async () => {
        const category = buildMenuCategory();
        menuCategoryRepository.findById.mockResolvedValue(category);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ position: 5 }));

        expect(category.position).toBe(5);
    });

    it('deactivates category when isActive is false', async () => {
        const category = buildMenuCategory({ isActive: true });
        menuCategoryRepository.findById.mockResolvedValue(category);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ isActive: false }));

        expect(category.isActive).toBe(false);
    });

    it('publishes MenuCategoryUpdatedEvent on success', async () => {
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ name: 'New Name' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuCategoryUpdatedEvent)]),
        );
    });

    it('invalidates public catalog cache after successful update', async () => {
        const cacheService = createMockCacheService();
        cacheService.delete.mockResolvedValue(undefined);
        const useCaseWithCache = new UpdateMenuCategoryUseCase(
            menuCategoryRepository,
            restaurantAccessReader,
            eventPublisher,
            cacheService,
        );
        const category = buildMenuCategory();
        menuCategoryRepository.findById.mockResolvedValue(category);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCaseWithCache.execute(command({ name: 'New Name' }));

        expect(cacheService.delete).toHaveBeenCalledWith(`catalog:public:${category.restaurantId.value}`);
    });
});
