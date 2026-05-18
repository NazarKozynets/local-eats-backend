import type { RestaurantRepository } from '../../application/ports/restaurant.repository.port';
import type { RestaurantStaffRepository } from '../../application/ports/restaurant-staff.repository.port';
import type { RestaurantWorkingHourRepository } from '../../application/ports/restaurant-working-hour.repository.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';
import type { AccountAccessReader } from '../../../iam/application/ports/account-access-reader.port';

export function createMockRestaurantRepository(): jest.Mocked<RestaurantRepository> {
    return {
        findById: jest.fn(),
        save: jest.fn(),
        createWithOwnerStaff: jest.fn(),
    };
}

export function createMockRestaurantStaffRepository(): jest.Mocked<RestaurantStaffRepository> {
    return {
        findByRestaurantAndUser: jest.fn(),
        findManyByUserId: jest.fn(),
        findManyByRestaurantId: jest.fn(),
        exists: jest.fn(),
        countOwners: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };
}

export function createMockRestaurantWorkingHourRepository(): jest.Mocked<RestaurantWorkingHourRepository> {
    return {
        findManyByRestaurantId: jest.fn(),
        replaceForRestaurant: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}

export function createMockAccountAccessReader(): jest.Mocked<AccountAccessReader> {
    return {
        findById: jest.fn(),
    };
}
