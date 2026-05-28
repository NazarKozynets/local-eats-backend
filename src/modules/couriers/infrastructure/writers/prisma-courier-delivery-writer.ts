import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CourierAvailabilityStatus } from '../../domain/enums/courier-availability-status.enum';
import { CourierProfilePrismaMapper } from '../persistence/mappers/courier-profile-prisma.mapper';
import type { CourierDeliveryWriter } from '../../application/ports/courier-delivery-writer.port';

@Injectable()
export class PrismaCourierDeliveryWriter implements CourierDeliveryWriter {
    constructor(private readonly prisma: PrismaService) {}

    async markBusy(courierProfileId: string): Promise<void> {
        const row = await this.prisma.courierProfile.findUnique({ where: { id: courierProfileId } });
        if (!row) return;
        const profile = CourierProfilePrismaMapper.toDomain(row);
        profile.setAvailability(CourierAvailabilityStatus.BUSY);
        await this.prisma.courierProfile.update({
            where: { id: courierProfileId },
            data: { availabilityStatus: CourierAvailabilityStatus.BUSY, updatedAt: profile.updatedAt },
        });
    }

    async markOnline(courierProfileId: string): Promise<void> {
        const row = await this.prisma.courierProfile.findUnique({ where: { id: courierProfileId } });
        if (!row) return;
        const profile = CourierProfilePrismaMapper.toDomain(row);
        profile.setAvailability(CourierAvailabilityStatus.ONLINE);
        await this.prisma.courierProfile.update({
            where: { id: courierProfileId },
            data: { availabilityStatus: CourierAvailabilityStatus.ONLINE, updatedAt: profile.updatedAt },
        });
    }

    async incrementCompletedDeliveries(courierProfileId: string): Promise<void> {
        await this.prisma.courierProfile.update({
            where: { id: courierProfileId },
            data: { completedDeliveriesCount: { increment: 1 }, updatedAt: new Date() },
        });
    }

    async updateLocation(courierProfileId: string, latitude: number, longitude: number): Promise<void> {
        await this.prisma.$executeRaw`
            UPDATE courier_profiles
            SET current_location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
                updated_at = NOW()
            WHERE id = ${courierProfileId}
        `;
    }
}
