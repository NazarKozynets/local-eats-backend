import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Restaurant } from '../../domain/entities/restaurant.entity';
import type { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import type { RestaurantRepository } from '../../application/ports/restaurant.repository.port';
import { RestaurantMapper } from './restaurant.mapper';
import { RestaurantStaffMapper } from './restaurant-staff.mapper';

@Injectable()
export class PrismaRestaurantRepository implements RestaurantRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Restaurant | null> {
        const row = await this.prisma.restaurant.findUnique({
            where: { id: id.value },
        });

        return row ? RestaurantMapper.toDomain(row) : null;
    }

    async save(restaurant: Restaurant): Promise<void> {
        const data = RestaurantMapper.toPersistence(restaurant);

        await this.prisma.restaurant.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                description: data.description,
                logoUrl: data.logoUrl,
                coverUrl: data.coverUrl,
                verificationStatus: data.verificationStatus,
                verificationRejectedReason: data.verificationRejectedReason,
                verifiedAt: data.verifiedAt,
                status: data.status,
                city: data.city,
                addressText: data.addressText,
                phone: data.phone,
                email: data.email,
                minOrderAmount: data.minOrderAmount,
                deliveryFee: data.deliveryFee,
                updatedAt: data.updatedAt,
            },
        });
    }

    async createWithOwnerStaff(restaurant: Restaurant, ownerStaff: RestaurantStaff): Promise<void> {
        const restaurantData = RestaurantMapper.toPersistence(restaurant);
        const staffData = RestaurantStaffMapper.toPersistence(ownerStaff);

        await this.prisma.$transaction([
            this.prisma.restaurant.create({ data: restaurantData }),
            this.prisma.restaurantStaff.create({ data: staffData }),
        ]);
    }
}
