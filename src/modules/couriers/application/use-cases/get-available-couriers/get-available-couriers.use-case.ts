import { Inject, Injectable } from '@nestjs/common';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import type { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export type AvailableCourierResult = {
    id: string;
    userId: string;
    displayName: string | null;
    vehicleType: CourierVehicleType | null;
    deliveryRadiusKm: number;
    ratingAvg: number;
    ratingCount: number;
};

@Injectable()
export class GetAvailableCouriersUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
    ) {}

    async execute(): Promise<AvailableCourierResult[]> {
        const couriers = await this.courierProfileRepository.findAvailable();

        return couriers.map((c) => ({
            id: c.id.value,
            userId: c.userId.value,
            displayName: c.displayName,
            vehicleType: c.vehicleType,
            deliveryRadiusKm: c.deliveryRadiusKm,
            ratingAvg: c.ratingAvg,
            ratingCount: c.ratingCount,
        }));
    }
}
