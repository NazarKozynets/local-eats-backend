import type { OrderRepository } from '../../application/ports/order.repository.port';
import type { OrderStatusHistoryRepository } from '../../application/ports/order-status-history.repository.port';
import type { OrderPublicCodeGenerator } from '../../application/ports/order-public-code-generator.port';
import type { CustomerOrderReader } from '../../application/ports/customer-order-reader.port';
import type { CatalogOrderReader } from '../../application/ports/catalog-order-reader.port';
import type { RestaurantOrderReader } from '../../application/ports/restaurant-order-reader.port';
import type { RestaurantAccessReader } from '../../../restaurants/application/ports/restaurant-access-reader.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockOrderRepository(): jest.Mocked<OrderRepository> {
    return {
        findById: jest.fn(),
        findByPublicCode: jest.fn(),
        findManyByCustomerId: jest.fn(),
        findManyByRestaurantId: jest.fn(),
        createWithItems: jest.fn(),
        saveWithHistory: jest.fn(),
    };
}

export function createMockOrderStatusHistoryRepository(): jest.Mocked<OrderStatusHistoryRepository> {
    return {
        findManyByOrderId: jest.fn(),
    };
}

export function createMockOrderPublicCodeGenerator(): jest.Mocked<OrderPublicCodeGenerator> {
    return {
        generate: jest.fn().mockReturnValue('LC-TESTCODE'),
    };
}

export function createMockCustomerOrderReader(): jest.Mocked<CustomerOrderReader> {
    return {
        getProfileByUserId: jest.fn(),
        getAddress: jest.fn(),
    };
}

export function createMockCatalogOrderReader(): jest.Mocked<CatalogOrderReader> {
    return {
        getItemsByIds: jest.fn(),
    };
}

export function createMockRestaurantOrderReader(): jest.Mocked<RestaurantOrderReader> {
    return {
        getDeliverySettings: jest.fn(),
    };
}

export function createMockRestaurantAccessReader(): jest.Mocked<RestaurantAccessReader> {
    return {
        canManageRestaurant: jest.fn(),
        getStaffRole: jest.fn(),
        isRestaurantActive: jest.fn(),
        existsActiveRestaurant: jest.fn(),
        findOwnerUserIds: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
