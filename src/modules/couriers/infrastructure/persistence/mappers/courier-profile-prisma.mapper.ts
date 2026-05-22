import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfile } from '../../../domain/entities/courier-profile.entity';
import type { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import type { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import type { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import type { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export class CourierProfilePrismaMapper {
    static toDomain(raw: any): CourierProfile {
        return CourierProfile.restore({
            id: UUID.create(raw.id),
            userId: UUID.create(raw.userId),
            displayName: raw.displayName ?? null,
            avatarUrl: raw.avatarUrl ?? null,
            verificationStatus: raw.verificationStatus as CourierVerificationStatus,
            verificationRejectedReason: raw.verificationRejectedReason ?? null,
            verifiedAt: raw.verifiedAt ?? null,
            profileStatus: raw.profileStatus as CourierProfileStatus,
            availabilityStatus: raw.availabilityStatus as CourierAvailabilityStatus,
            vehicleType: (raw.vehicleType as CourierVehicleType) ?? null,
            currentLocation: null,
            deliveryRadiusKm: raw.deliveryRadiusKm,
            completedDeliveriesCount: raw.completedDeliveriesCount,
            ratingAvg: raw.ratingAvg,
            ratingCount: raw.ratingCount,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(profile: CourierProfile) {
        return {
            id: profile.id.value,
            userId: profile.userId.value,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            verificationStatus: profile.verificationStatus,
            verificationRejectedReason: profile.verificationRejectedReason,
            verifiedAt: profile.verifiedAt,
            profileStatus: profile.profileStatus,
            availabilityStatus: profile.availabilityStatus,
            vehicleType: profile.vehicleType,
            deliveryRadiusKm: profile.deliveryRadiusKm,
            completedDeliveriesCount: profile.completedDeliveriesCount,
            ratingAvg: profile.ratingAvg,
            ratingCount: profile.ratingCount,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
