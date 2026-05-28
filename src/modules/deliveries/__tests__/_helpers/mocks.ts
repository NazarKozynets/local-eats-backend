import type { OrderDeliveryReader } from '../../../orders/application/ports/order-delivery-reader.port';
import type { OrderDeliveryWriter } from '../../../orders/application/ports/order-delivery-writer.port';
import type { CourierAccessReader } from '../../../couriers/application/ports/courier-access-reader.port';
import type { CourierDeliveryWriter } from '../../../couriers/application/ports/courier-delivery-writer.port';
import type { RestaurantAccessReader } from '../../../restaurants/application/ports/restaurant-access-reader.port';
import type { DeliveryProblemReportRepository } from '../../application/ports/delivery-problem-report.repository.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockOrderDeliveryReader(): jest.Mocked<OrderDeliveryReader> {
    return {
        findById: jest.fn(),
        findActiveDeliveryByCourierId: jest.fn(),
    };
}

export function createMockOrderDeliveryWriter(): jest.Mocked<OrderDeliveryWriter> {
    return {
        assignCourier: jest.fn(),
        unassignCourier: jest.fn(),
        markPickedUp: jest.fn(),
        startDelivering: jest.fn(),
        markDelivered: jest.fn(),
        markProblem: jest.fn(),
    };
}

export function createMockCourierAccessReader(): jest.Mocked<CourierAccessReader> {
    return {
        findById: jest.fn(),
        findByUserId: jest.fn(),
        isCourierReadyForDelivery: jest.fn(),
        findAvailableCouriers: jest.fn(),
    };
}

export function createMockCourierDeliveryWriter(): jest.Mocked<CourierDeliveryWriter> {
    return {
        markBusy: jest.fn(),
        markOnline: jest.fn(),
        incrementCompletedDeliveries: jest.fn(),
        updateLocation: jest.fn(),
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

export function createMockDeliveryProblemReportRepository(): jest.Mocked<DeliveryProblemReportRepository> {
    return {
        findById: jest.fn(),
        save: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
