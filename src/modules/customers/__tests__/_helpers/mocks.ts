import type { CustomerProfileRepository } from '../../application/ports/customer-profile.repository.port';
import type { CustomerAddressRepository } from '../../application/ports/customer-address.repository.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';
import type { AccountAccessReader } from '../../../iam/application/ports/account-access-reader.port';

export function createMockCustomerProfileRepository(): jest.Mocked<CustomerProfileRepository> {
    return {
        findById: jest.fn(),
        findByUserId: jest.fn(),
        existsByUserId: jest.fn(),
        save: jest.fn(),
    };
}

export function createMockCustomerAddressRepository(): jest.Mocked<CustomerAddressRepository> {
    return {
        findById: jest.fn(),
        findManyByCustomerId: jest.fn(),
        countByCustomerId: jest.fn(),
        findOldestByCustomerId: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        setDefaultAddress: jest.fn(),
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
