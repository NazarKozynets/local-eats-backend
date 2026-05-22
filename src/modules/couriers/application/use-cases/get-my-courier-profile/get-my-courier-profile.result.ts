import type { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import type { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import type { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import type { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export type CourierProfileResult = {
    id: string;
    userId: string;
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
};
