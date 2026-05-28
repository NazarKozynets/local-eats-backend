import { DeleteMenuItemUseCase } from './delete-menu-item.use-case';
import { DeleteMenuItemCommand } from './delete-menu-item.command';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';
import { MenuItemDeletedEvent } from '../../../domain/events/menu-item-deleted.event';
import {
    TEST_USER_ID,
    TEST_ITEM_ID,
    buildMenuItem,
} from '../../../__tests__/_helpers/builders';
import {
    createMockMenuItemRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
    createMockCacheService,
} from '../../../__tests__/_helpers/mocks';

describe('DeleteMenuItemUseCase', () => {
    let menuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: DeleteMenuItemUseCase;

    beforeEach(() => {
        menuItemRepository = createMockMenuItemRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new DeleteMenuItemUseCase(
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuItemRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        DeleteMenuItemCommand.create({
            currentUserId: TEST_USER_ID,
            menuItemId: TEST_ITEM_ID,
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

    it('hides item (sets status to HIDDEN) instead of hard deleting', async () => {
        const item = buildMenuItem({ status: MenuItemStatus.AVAILABLE });
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(item.status).toBe(MenuItemStatus.HIDDEN);
        expect(menuItemRepository.save).toHaveBeenCalledWith(item);
    });

    it('publishes MenuItemDeletedEvent on success', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuItemDeletedEvent)]),
        );
    });

    it('invalidates public catalog cache after successful deletion', async () => {
        const cacheService = createMockCacheService();
        cacheService.delete.mockResolvedValue(undefined);
        const useCaseWithCache = new DeleteMenuItemUseCase(
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
            cacheService,
        );
        const item = buildMenuItem();
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCaseWithCache.execute(command());

        expect(cacheService.delete).toHaveBeenCalledWith(`catalog:public:${item.restaurantId.value}`);
    });
});
