import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { RestaurantAccessReader } from '../../application/ports/restaurant-access-reader.port';
import type { RestaurantStaffRole } from '../../domain/enums/restaurant-staff-role.enum';

@Injectable()
export class PrismaRestaurantAccessReader implements RestaurantAccessReader {
    constructor(private readonly prisma: PrismaService) {}

    async canManageRestaurant(userId: string, restaurantId: string): Promise<boolean> {
        const row = await this.prisma.restaurantStaff.findUnique({
            where: {
                uq_restaurant_staff_restaurant_user: { restaurantId, userId },
            },
            select: { id: true },
        });

        return row !== null;
    }

    async getStaffRole(userId: string, restaurantId: string): Promise<RestaurantStaffRole | null> {
        const row = await this.prisma.restaurantStaff.findUnique({
            where: {
                uq_restaurant_staff_restaurant_user: { restaurantId, userId },
            },
            select: { role: true },
        });

        return row ? (row.role as RestaurantStaffRole) : null;
    }

    async isRestaurantActive(restaurantId: string): Promise<boolean> {
        const row = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { status: true },
        });

        return row?.status === 'ACTIVE';
    }

    async existsActiveRestaurant(restaurantId: string): Promise<boolean> {
        const row = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { status: true },
        });

        return row !== null && row.status === 'ACTIVE';
    }
}
