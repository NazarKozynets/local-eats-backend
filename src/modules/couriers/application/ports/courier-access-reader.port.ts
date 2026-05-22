import type { CourierAvailabilityStatus } from '../../domain/enums/courier-availability-status.enum';
import type { CourierProfileStatus } from '../../domain/enums/courier-profile-status.enum';
import type { CourierVerificationStatus } from '../../domain/enums/courier-verification-status.enum';
import type { CourierVehicleType } from '../../domain/enums/courier-vehicle-type.enum';

export const COURIER_ACCESS_READER = Symbol('COURIER_ACCESS_READER');

export type CourierAccessView = {
    courierProfileId: string;
    userId: string;
    profileStatus: CourierProfileStatus;
    verificationStatus: CourierVerificationStatus;
    availabilityStatus: CourierAvailabilityStatus;
    vehicleType: CourierVehicleType | null;
    deliveryRadiusKm: number;
    ratingAvg: number;
    ratingCount: number;
};

export interface CourierAccessReader {
    findById(courierProfileId: string): Promise<CourierAccessView | null>;
    findByUserId(userId: string): Promise<CourierAccessView | null>;
    isCourierReadyForDelivery(courierProfileId: string): Promise<boolean>;
    findAvailableCouriers(): Promise<CourierAccessView[]>;
}
