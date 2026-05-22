import type { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export type UpdateCourierProfileCommand = {
    currentUserId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    vehicleType?: CourierVehicleType | null;
    deliveryRadiusKm?: number;
};
