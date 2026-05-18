import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import type { RestaurantStaffRepository } from '../../application/ports/restaurant-staff.repository.port';
import { RestaurantStaffMapper } from './restaurant-staff.mapper';

@Injectable()
export class PrismaRestaurantStaffRepository implements RestaurantStaffRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByRestaurantAndUser(restaurantId: UUID, userId: UUID): Promise<RestaurantStaff | null> {
        const row = await this.prisma.restaurantStaff.findUnique({
            where: {
                uq_restaurant_staff_restaurant_user: {
                    restaurantId: restaurantId.value,
                    userId: userId.value,
                },
            },
        });

        return row ? RestaurantStaffMapper.toDomain(row) : null;
    }

    async findManyByUserId(userId: UUID): Promise<RestaurantStaff[]> {
        const rows = await this.prisma.restaurantStaff.findMany({
            where: { userId: userId.value },
        });

        return rows.map(RestaurantStaffMapper.toDomain);
    }

    async findManyByRestaurantId(restaurantId: UUID): Promise<RestaurantStaff[]> {
        const rows = await this.prisma.restaurantStaff.findMany({
            where: { restaurantId: restaurantId.value },
        });

        return rows.map(RestaurantStaffMapper.toDomain);
    }

    async exists(restaurantId: UUID, userId: UUID): Promise<boolean> {
        const row = await this.prisma.restaurantStaff.findUnique({
            where: {
                uq_restaurant_staff_restaurant_user: {
                    restaurantId: restaurantId.value,
                    userId: userId.value,
                },
            },
            select: { id: true },
        });

        return row !== null;
    }

    async countOwners(restaurantId: UUID): Promise<number> {
        return this.prisma.restaurantStaff.count({
            where: {
                restaurantId: restaurantId.value,
                role: 'OWNER',
            },
        });
    }

    async save(staff: RestaurantStaff): Promise<void> {
        const data = RestaurantStaffMapper.toPersistence(staff);

        await this.prisma.restaurantStaff.upsert({
            where: { id: data.id },
            create: data,
            update: {
                role: data.role,
                updatedAt: data.updatedAt,
            },
        });
    }

    async delete(staffId: UUID): Promise<void> {
        await this.prisma.restaurantStaff.delete({
            where: { id: staffId.value },
        });
    }
}
