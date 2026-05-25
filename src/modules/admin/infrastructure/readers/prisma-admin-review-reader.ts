import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminReviewReadModel,
    AdminReviewFilters,
    AdminReviewReader,
} from '../../application/ports/admin-review-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminReviewReader implements AdminReviewReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminReviewFilters): Promise<AdminReviewReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.review.findMany({
            where: {
                ...(filters.target ? { target: filters.target as never } : {}),
                ...(filters.restaurantId ? { restaurantId: filters.restaurantId } : {}),
                ...(filters.courierId ? { courierId: filters.courierId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                orderId: true,
                reviewerUserId: true,
                target: true,
                restaurantId: true,
                courierId: true,
                rating: true,
                comment: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            orderId: row.orderId,
            reviewerUserId: row.reviewerUserId,
            target: row.target as string,
            restaurantId: row.restaurantId,
            courierId: row.courierId,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.createdAt,
        }));
    }
}
