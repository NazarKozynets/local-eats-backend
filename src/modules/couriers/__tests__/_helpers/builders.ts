import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfile } from '../../domain/entities/courier-profile.entity';
import { CourierVerificationStatus } from '../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../domain/enums/courier-availability-status.enum';
import { CourierVehicleType } from '../../domain/enums/courier-vehicle-type.enum';
import type { AccountSnapshot } from '../../../iam/application/ports/account-access-reader.port';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_COURIER_PROFILE_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_ADMIN_USER_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_OTHER_USER_ID = '880e8400-e29b-41d4-a716-446655440003';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildCourierProfileOverrides = Partial<{
    id: UUID;
    userId: UUID;
    displayName: string | null;
    avatarUrl: string | null;
    verificationStatus: CourierVerificationStatus;
    verificationRejectedReason: string | null;
    verifiedAt: Date | null;
    profileStatus: CourierProfileStatus;
    availabilityStatus: CourierAvailabilityStatus;
    vehicleType: CourierVehicleType | null;
    deliveryRadiusKm: number;
    completedDeliveriesCount: number;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildCourierProfile(overrides: BuildCourierProfileOverrides = {}): CourierProfile {
    return CourierProfile.restore({
        id: overrides.id ?? UUID.create(TEST_COURIER_PROFILE_ID),
        userId: overrides.userId ?? UUID.create(TEST_USER_ID),
        displayName: overrides.displayName !== undefined ? overrides.displayName : 'Test Courier',
        avatarUrl: overrides.avatarUrl !== undefined ? overrides.avatarUrl : null,
        verificationStatus: overrides.verificationStatus ?? CourierVerificationStatus.UNVERIFIED,
        verificationRejectedReason:
            overrides.verificationRejectedReason !== undefined
                ? overrides.verificationRejectedReason
                : null,
        verifiedAt: overrides.verifiedAt !== undefined ? overrides.verifiedAt : null,
        profileStatus: overrides.profileStatus ?? CourierProfileStatus.INCOMPLETE,
        availabilityStatus: overrides.availabilityStatus ?? CourierAvailabilityStatus.OFFLINE,
        vehicleType: overrides.vehicleType !== undefined ? overrides.vehicleType : CourierVehicleType.BICYCLE,
        currentLocation: null,
        deliveryRadiusKm: overrides.deliveryRadiusKm ?? 5,
        completedDeliveriesCount: overrides.completedDeliveriesCount ?? 0,
        ratingAvg: overrides.ratingAvg ?? 0,
        ratingCount: overrides.ratingCount ?? 0,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

export function buildVerifiedActiveCourier(overrides: BuildCourierProfileOverrides = {}): CourierProfile {
    return buildCourierProfile({
        verificationStatus: CourierVerificationStatus.VERIFIED,
        profileStatus: CourierProfileStatus.ACTIVE,
        availabilityStatus: CourierAvailabilityStatus.OFFLINE,
        verifiedAt: FIXED_DATE,
        ...overrides,
    });
}

export function buildAccountSnapshot(overrides: Partial<AccountSnapshot> = {}): AccountSnapshot {
    return {
        id: overrides.id ?? TEST_USER_ID,
        status: overrides.status ?? 'ACTIVE',
        role: overrides.role ?? 'COURIER',
    };
}
