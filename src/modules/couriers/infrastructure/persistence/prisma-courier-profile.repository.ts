import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CourierVerificationStatus } from '../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../domain/enums/courier-availability-status.enum';
import type { CourierProfile } from '../../domain/entities/courier-profile.entity';
import type { CourierProfileRepository } from '../../application/ports/courier-profile.repository.port';
import { CourierProfilePrismaMapper } from './mappers/courier-profile-prisma.mapper';

@Injectable()
export class PrismaCourierProfileRepository implements CourierProfileRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<CourierProfile | null> {
        const row = await this.prisma.courierProfile.findUnique({
            where: { id: id.value },
        });

        return row ? CourierProfilePrismaMapper.toDomain(row) : null;
    }

    async findByUserId(userId: UUID): Promise<CourierProfile | null> {
        const row = await this.prisma.courierProfile.findUnique({
            where: { userId: userId.value },
        });

        return row ? CourierProfilePrismaMapper.toDomain(row) : null;
    }

    async existsByUserId(userId: UUID): Promise<boolean> {
        const count = await this.prisma.courierProfile.count({
            where: { userId: userId.value },
        });

        return count > 0;
    }

    async save(profile: CourierProfile): Promise<void> {
        const data = CourierProfilePrismaMapper.toPersistence(profile);

        await this.prisma.courierProfile.upsert({
            where: { id: data.id },
            create: data,
            update: {
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                verificationStatus: data.verificationStatus,
                verificationRejectedReason: data.verificationRejectedReason,
                verifiedAt: data.verifiedAt,
                profileStatus: data.profileStatus,
                availabilityStatus: data.availabilityStatus,
                vehicleType: data.vehicleType,
                deliveryRadiusKm: data.deliveryRadiusKm,
                completedDeliveriesCount: data.completedDeliveriesCount,
                ratingAvg: data.ratingAvg,
                ratingCount: data.ratingCount,
                updatedAt: data.updatedAt,
            },
        });

        const location = profile.currentLocation;
        if (location !== null) {
            await this.prisma.$executeRaw`
                UPDATE courier_profiles
                SET current_location = ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
                WHERE id = ${data.id}
            `;
        }
    }

    async findAvailable(): Promise<CourierProfile[]> {
        const rows = await this.prisma.courierProfile.findMany({
            where: {
                verificationStatus: CourierVerificationStatus.VERIFIED,
                profileStatus: CourierProfileStatus.ACTIVE,
                availabilityStatus: CourierAvailabilityStatus.ONLINE,
            },
        });

        return rows.map(CourierProfilePrismaMapper.toDomain);
    }
}
