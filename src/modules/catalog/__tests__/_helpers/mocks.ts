import type { MenuCategoryRepository } from '../../application/ports/menu-category.repository.port';
import type { MenuItemRepository } from '../../application/ports/menu-item.repository.port';
import type { CatalogReader } from '../../application/ports/catalog-reader.port';
import type { RestaurantAccessReader } from '../../../restaurants/application/ports/restaurant-access-reader.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockMenuCategoryRepository(): jest.Mocked<MenuCategoryRepository> {
    return {
        findById: jest.fn(),
        findByRestaurantId: jest.fn(),
        existsByNameInRestaurant: jest.fn(),
        hasItems: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };
}

export function createMockMenuItemRepository(): jest.Mocked<MenuItemRepository> {
    return {
        findById: jest.fn(),
        findByRestaurantId: jest.fn(),
        findByCategoryId: jest.fn(),
        save: jest.fn(),
    };
}

export function createMockCatalogReader(): jest.Mocked<CatalogReader> {
    return {
        getManagerCatalog: jest.fn(),
        getPublicCatalog: jest.fn(),
    };
}

export function createMockRestaurantAccessReader(): jest.Mocked<RestaurantAccessReader> {
    return {
        canManageRestaurant: jest.fn(),
        getStaffRole: jest.fn(),
        isRestaurantActive: jest.fn(),
        existsActiveRestaurant: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
