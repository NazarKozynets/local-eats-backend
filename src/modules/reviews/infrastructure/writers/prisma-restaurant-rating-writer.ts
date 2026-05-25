import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { RestaurantRatingWriter } from '../../application/ports/restaurant-rating-writer.port';

@Injectable()
export class PrismaRestaurantRatingWriter implements RestaurantRatingWriter {
    constructor(private readonly prisma: PrismaService) {}

    async updateRating(restaurantId: string, ratingAvg: number, ratingCount: number): Promise<void> {
        await this.prisma.restaurant.update({
            where: { id: restaurantId },
            data: { ratingAvg, ratingCount },
        });
    }
}
