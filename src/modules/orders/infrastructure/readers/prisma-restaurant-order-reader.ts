import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    RestaurantOrderReader,
    RestaurantDeliverySettings,
} from '../../application/ports/restaurant-order-reader.port';

@Injectable()
export class PrismaRestaurantOrderReader implements RestaurantOrderReader {
    constructor(private readonly prisma: PrismaService) {}

    async getDeliverySettings(restaurantId: string): Promise<RestaurantDeliverySettings | null> {
        const row = await this.prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                deliveryFee: true,
                minOrderAmount: true,
            },
        });

        if (!row) {
            return null;
        }

        return {
            deliveryFee: Number(row.deliveryFee),
            minOrderAmount: Number(row.minOrderAmount),
        };
    }
}
