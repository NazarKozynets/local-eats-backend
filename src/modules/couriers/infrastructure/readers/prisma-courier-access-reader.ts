import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CourierVerificationStatus } from '../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../domain/enums/courier-availability-status.enum';
import type {
    CourierAccessReader,
    CourierAccessView,
} from '../../application/ports/courier-access-reader.port';
import type { CourierVehicleType } from '../../domain/enums/courier-vehicle-type.enum';

@Injectable()
export class PrismaCourierAccessReader implements CourierAccessReader {
    constructor(private readonly prisma: PrismaService) {}

    async findById(courierProfileId: string): Promise<CourierAccessView | null> {
        const row = await this.prisma.courierProfile.findUnique({
            where: { id: courierProfileId },
            select: {
                id: true,
                userId: true,
                profileStatus: true,
                verificationStatus: true,
                availabilityStatus: true,
                vehicleType: true,
                deliveryRadiusKm: true,
                ratingAvg: true,
                ratingCount: true,
            },
        });

        return row ? this.toView(row) : null;
    }

    async findByUserId(userId: string): Promise<CourierAccessView | null> {
        const row = await this.prisma.courierProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                userId: true,
                profileStatus: true,
                verificationStatus: true,
                availabilityStatus: true,
                vehicleType: true,
                deliveryRadiusKm: true,
                ratingAvg: true,
                ratingCount: true,
            },
        });

        return row ? this.toView(row) : null;
    }

    async isCourierReadyForDelivery(courierProfileId: string): Promise<boolean> {
        const row = await this.prisma.courierProfile.findUnique({
            where: { id: courierProfileId },
            select: {
                verificationStatus: true,
                profileStatus: true,
                availabilityStatus: true,
            },
        });

        if (!row) return false;

        return (
            row.verificationStatus === CourierVerificationStatus.VERIFIED &&
            row.profileStatus === CourierProfileStatus.ACTIVE &&
            row.availabilityStatus === CourierAvailabilityStatus.ONLINE
        );
    }

    async findAvailableCouriers(): Promise<CourierAccessView[]> {
        const rows = await this.prisma.courierProfile.findMany({
            where: {
                verificationStatus: CourierVerificationStatus.VERIFIED,
                profileStatus: CourierProfileStatus.ACTIVE,
                availabilityStatus: CourierAvailabilityStatus.ONLINE,
            },
            select: {
                id: true,
                userId: true,
                profileStatus: true,
                verificationStatus: true,
                availabilityStatus: true,
                vehicleType: true,
                deliveryRadiusKm: true,
                ratingAvg: true,
                ratingCount: true,
            },
        });

        return rows.map((r) => this.toView(r));
    }

    private toView(row: any): CourierAccessView {
        return {
            courierProfileId: row.id,
            userId: row.userId,
            profileStatus: row.profileStatus,
            verificationStatus: row.verificationStatus,
            availabilityStatus: row.availabilityStatus,
            vehicleType: (row.vehicleType as CourierVehicleType) ?? null,
            deliveryRadiusKm: row.deliveryRadiusKm,
            ratingAvg: row.ratingAvg,
            ratingCount: row.ratingCount,
        };
    }
}
