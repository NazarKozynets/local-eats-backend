import { ChangeMenuItemStatusUseCase } from './change-menu-item-status.use-case';
import { ChangeMenuItemStatusCommand } from './change-menu-item-status.command';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';
import { MenuItemStatusChangedEvent } from '../../../domain/events/menu-item-status-changed.event';
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

describe('ChangeMenuItemStatusUseCase', () => {
    let menuItemRepository: ReturnType<typeof createMockMenuItemRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ChangeMenuItemStatusUseCase;

    beforeEach(() => {
        menuItemRepository = createMockMenuItemRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new ChangeMenuItemStatusUseCase(
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuItemRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (status: MenuItemStatus) =>
        ChangeMenuItemStatusCommand.create({
            currentUserId: TEST_USER_ID,
            menuItemId: TEST_ITEM_ID,
            status,
        });

    it('throws MenuItemNotFoundError when item does not exist', async () => {
        menuItemRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command(MenuItemStatus.AVAILABLE))).rejects.toBeInstanceOf(
            MenuItemNotFoundError,
        );
    });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command(MenuItemStatus.AVAILABLE))).rejects.toBeInstanceOf(
            RestaurantCatalogAccessDeniedError,
        );
    });

    it('changes status to AVAILABLE', async () => {
        const item = buildMenuItem({ status: MenuItemStatus.UNAVAILABLE });
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command(MenuItemStatus.AVAILABLE));

        expect(item.status).toBe(MenuItemStatus.AVAILABLE);
    });

    it('changes status to UNAVAILABLE', async () => {
        const item = buildMenuItem({ status: MenuItemStatus.AVAILABLE });
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command(MenuItemStatus.UNAVAILABLE));

        expect(item.status).toBe(MenuItemStatus.UNAVAILABLE);
    });

    it('changes status to HIDDEN', async () => {
        const item = buildMenuItem({ status: MenuItemStatus.AVAILABLE });
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command(MenuItemStatus.HIDDEN));

        expect(item.status).toBe(MenuItemStatus.HIDDEN);
    });

    it('publishes MenuItemStatusChangedEvent on success', async () => {
        menuItemRepository.findById.mockResolvedValue(buildMenuItem());
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCase.execute(command(MenuItemStatus.UNAVAILABLE));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuItemStatusChangedEvent)]),
        );
    });

    it('invalidates public catalog cache after status change', async () => {
        const cacheService = createMockCacheService();
        cacheService.delete.mockResolvedValue(undefined);
        const useCaseWithCache = new ChangeMenuItemStatusUseCase(
            menuItemRepository,
            restaurantAccessReader,
            eventPublisher,
            cacheService,
        );
        const item = buildMenuItem();
        menuItemRepository.findById.mockResolvedValue(item);
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);

        await useCaseWithCache.execute(command(MenuItemStatus.UNAVAILABLE));

        expect(cacheService.delete).toHaveBeenCalledWith(`catalog:public:${item.restaurantId.value}`);
    });
});
