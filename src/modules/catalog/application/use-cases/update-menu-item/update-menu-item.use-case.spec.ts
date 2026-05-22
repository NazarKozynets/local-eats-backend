import { UpdateMenuItemUseCase } from './update-menu-item.use-case';
import { UpdateMenuItemCommand } from './update-menu-item.command';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryAccessDeniedError } from '../../../domain/errors/menu-category-access-denied.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { InvalidMenuItemNameError } from '../../../domain/errors/invalid-menu-item-name.error';
import { InvalidMenuItemPriceError } from '../../../domain/errors/invalid-menu-item-price.error';
import { MenuItemUpdatedEvent } from '../../../domain/events/menu-item-updated.event';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    TEST_USER_ID,
    TEST_ITEM_ID,
    TEST_CATEGORY_ID,
    TEST_OTHER_RESTAURANT_ID,
    buildMenuItem,
    buildMenuCategory,
} from '../../../__tests__/_helpers/builders';
import {
    createMockMenuCategoryRepository,
    createMockMenuItemRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateMenuItemUseCase', () => {
    let menuCategoryRepository: ReturnType<typeof createMockMenuCategoryRepository>;
    let menuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateMenuItemUseCase;

    beforeEach(() => {
        menuCategoryRepository = createMockMenuCategoryRepository();
        menuItemRepository = createMockMenuItemRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateMenuItemUseCase(
            menuCategoryRepository,
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuItemRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides: Partial<Parameters<typeof UpdateMenuItemCommand.create>[0]> = {}) =>
        UpdateMenuItemCommand.create({
            currentUserId: TEST_USER_ID,
            menuItemId: TEST_ITEM_ID,
            ...overrides,
        });

    it('throws MenuItemNotFoundError when item does not exist', async () => {
        menuItemRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(MenuItemNotFoundError);
    });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantCatalogAccessDeniedError);
    });

    it('throws MenuCategoryNotFoundError when moving to non-existent category', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command({ categoryId: TEST_CATEGORY_ID }))).rejects.toBeInstanceOf(
            MenuCategoryNotFoundError,
        );
    });

    it('throws MenuCategoryAccessDeniedError when moving to category of another restaurant', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(
            buildMenuCategory({ restaurantId: UUID.create(TEST_OTHER_RESTAURANT_ID) }),
        );

        await expect(useCase.execute(command({ categoryId: TEST_CATEGORY_ID }))).rejects.toBeInstanceOf(
            MenuCategoryAccessDeniedError,
        );
    });

    it('throws InvalidMenuItemNameError for empty name', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command({ name: '  ' }))).rejects.toBeInstanceOf(InvalidMenuItemNameError);
    });

    it('throws InvalidMenuItemPriceError for negative price', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command({ price: -5 }))).rejects.toBeInstanceOf(InvalidMenuItemPriceError);
    });

    it('updates item fields and saves', async () => {
        const item = buildMenuItem();
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ name: 'Updated Name', price: 19.99 }));

        expect(item.name.value).toBe('Updated Name');
        expect(item.price.value).toBe(19.99);
        expect(menuItemRepository.save).toHaveBeenCalledWith(item);
    });

    it('moves item to category from same restaurant', async () => {
        const item = buildMenuItem();
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.findById.mockResolvedValue(buildMenuCategory());

        await useCase.execute(command({ categoryId: TEST_CATEGORY_ID }));

        expect(menuItemRepository.save).toHaveBeenCalledWith(item);
    });

    it('publishes MenuItemUpdatedEvent on success', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command({ name: 'Updated Name' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuItemUpdatedEvent)]),
        );
    });
});
