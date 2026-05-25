import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { CourierRatingWriter } from '../../application/ports/courier-rating-writer.port';

@Injectable()
export class PrismaCourierRatingWriter implements CourierRatingWriter {
    constructor(private readonly prisma: PrismaService) {}

    async updateRating(courierId: string, ratingAvg: number, ratingCount: number): Promise<void> {
        await this.prisma.courierProfile.update({
            where: { id: courierId },
            data: { ratingAvg, ratingCount },
        });
    }
}
