import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantName } from '../../domain/value-objects/restaurant-name.vo';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import { RestaurantWorkingHour } from '../../domain/entities/restaurant-working-hour.entity';
import { RestaurantStatus } from '../../domain/enums/restaurant-status.enum';
import { RestaurantVerificationStatus } from '../../domain/enums/restaurant-verification-status.enum';
import { RestaurantStaffRole } from '../../domain/enums/restaurant-staff-role.enum';
import type { AccountSnapshot } from '../../../iam/application/ports/account-access-reader.port';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_STAFF_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_TARGET_USER_ID = '880e8400-e29b-41d4-a716-446655440003';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildRestaurantOverrides = Partial<{
    id: UUID;
    name: RestaurantName;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    verificationStatus: RestaurantVerificationStatus;
    verificationRejectedReason: string | null;
    verifiedAt: Date | null;
    status: RestaurantStatus;
    city: string;
    addressText: string;
    phone: string | null;
    email: string | null;
    minOrderAmount: number;
    deliveryFee: number;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildRestaurant(overrides: BuildRestaurantOverrides = {}): Restaurant {
    return Restaurant.restore({
        id: overrides.id ?? UUID.create(TEST_RESTAURANT_ID),
        name: overrides.name ?? RestaurantName.create('Test Restaurant'),
        description: overrides.description !== undefined ? overrides.description : null,
        logoUrl: overrides.logoUrl !== undefined ? overrides.logoUrl : null,
        coverUrl: overrides.coverUrl !== undefined ? overrides.coverUrl : null,
        verificationStatus: overrides.verificationStatus ?? RestaurantVerificationStatus.UNVERIFIED,
        verificationRejectedReason: overrides.verificationRejectedReason !== undefined
            ? overrides.verificationRejectedReason
            : null,
        verifiedAt: overrides.verifiedAt !== undefined ? overrides.verifiedAt : null,
        status: overrides.status ?? RestaurantStatus.DRAFT,
        city: overrides.city ?? 'Kyiv',
        addressText: overrides.addressText ?? 'Khreshchatyk St, 1',
        phone: overrides.phone !== undefined ? overrides.phone : null,
        email: overrides.email !== undefined ? overrides.email : null,
        minOrderAmount: overrides.minOrderAmount ?? 0,
        deliveryFee: overrides.deliveryFee ?? 0,
        ratingAvg: overrides.ratingAvg ?? 0,
        ratingCount: overrides.ratingCount ?? 0,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

type BuildStaffOverrides = Partial<{
    id: UUID;
    restaurantId: UUID;
    userId: UUID;
    role: RestaurantStaffRole;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildStaff(overrides: BuildStaffOverrides = {}): RestaurantStaff {
    return RestaurantStaff.restore({
        id: overrides.id ?? UUID.create(TEST_STAFF_ID),
        restaurantId: overrides.restaurantId ?? UUID.create(TEST_RESTAURANT_ID),
        userId: overrides.userId ?? UUID.create(TEST_USER_ID),
        role: overrides.role ?? RestaurantStaffRole.OWNER,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

type BuildWorkingHourOverrides = Partial<{
    id: UUID;
    restaurantId: UUID;
    dayOfWeek: number;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildWorkingHour(overrides: BuildWorkingHourOverrides = {}): RestaurantWorkingHour {
    return RestaurantWorkingHour.restore({
        id: overrides.id ?? UUID.create('aa0e8400-e29b-41d4-a716-446655440000'),
        restaurantId: overrides.restaurantId ?? UUID.create(TEST_RESTAURANT_ID),
        dayOfWeek: overrides.dayOfWeek ?? 1,
        opensAt: overrides.opensAt !== undefined ? overrides.opensAt : '09:00',
        closesAt: overrides.closesAt !== undefined ? overrides.closesAt : '22:00',
        isClosed: overrides.isClosed ?? false,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

export function buildAccountSnapshot(overrides: Partial<AccountSnapshot> = {}): AccountSnapshot {
    return {
        id: overrides.id ?? TEST_USER_ID,
        status: overrides.status ?? 'ACTIVE',
        role: overrides.role ?? 'RESTAURANT_MANAGER',
    };
}
