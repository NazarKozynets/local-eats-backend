import type { CourierProfileRepository } from '../../application/ports/courier-profile.repository.port';
import type { CourierAccessReader } from '../../application/ports/courier-access-reader.port';
import type { AccountAccessReader } from '../../../iam/application/ports/account-access-reader.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockCourierProfileRepository(): jest.Mocked<CourierProfileRepository> {
    return {
        findById: jest.fn(),
        findByUserId: jest.fn(),
        existsByUserId: jest.fn(),
        save: jest.fn(),
        findAvailable: jest.fn(),
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

export function createMockAccountAccessReader(): jest.Mocked<AccountAccessReader> {
    return {
        findById: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
