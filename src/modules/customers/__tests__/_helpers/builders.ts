import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CustomerDisplayName } from '../../domain/value-objects/customer-display-name.vo';
import { CustomerProfile } from '../../domain/entities/customer-profile.entity';
import { CustomerAddress } from '../../domain/entities/customer-address.entity';
import type { AccountSnapshot } from '../../../iam/application/ports/account-access-reader.port';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_PROFILE_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_ADDRESS_ID = '770e8400-e29b-41d4-a716-446655440002';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildProfileOverrides = Partial<{
    id: UUID;
    userId: UUID;
    displayName: CustomerDisplayName | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildCustomerProfile(overrides: BuildProfileOverrides = {}): CustomerProfile {
    return CustomerProfile.restore({
        id: overrides.id ?? UUID.create(TEST_PROFILE_ID),
        userId: overrides.userId ?? UUID.create(TEST_USER_ID),
        displayName: overrides.displayName !== undefined
            ? overrides.displayName
            : CustomerDisplayName.create('Test User'),
        avatarUrl: overrides.avatarUrl !== undefined ? overrides.avatarUrl : null,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

type BuildAddressOverrides = Partial<{
    id: UUID;
    customerId: UUID;
    label: string | null;
    city: string;
    street: string;
    building: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    comment: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildCustomerAddress(overrides: BuildAddressOverrides = {}): CustomerAddress {
    return CustomerAddress.restore({
        id: overrides.id ?? UUID.create(TEST_ADDRESS_ID),
        customerId: overrides.customerId ?? UUID.create(TEST_PROFILE_ID),
        label: overrides.label !== undefined ? overrides.label : 'Home',
        city: overrides.city ?? 'Kyiv',
        street: overrides.street ?? 'Khreshchatyk Street',
        building: overrides.building ?? '1',
        apartment: overrides.apartment !== undefined ? overrides.apartment : null,
        entrance: overrides.entrance !== undefined ? overrides.entrance : null,
        floor: overrides.floor !== undefined ? overrides.floor : null,
        comment: overrides.comment !== undefined ? overrides.comment : null,
        isDefault: overrides.isDefault ?? false,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

export function buildAccountSnapshot(overrides: Partial<AccountSnapshot> = {}): AccountSnapshot {
    return {
        id: overrides.id ?? TEST_USER_ID,
        status: overrides.status ?? 'ACTIVE',
        role: overrides.role ?? 'CUSTOMER',
    };
}
