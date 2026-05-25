import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Review } from '../../domain/entities/review.entity';
import type { ReviewTarget } from '../../domain/enums/review-target.enum';
import type { ReviewRepository, ReviewPagination, ReviewRatingStats } from '../../application/ports/review.repository.port';
import { ReviewPrismaMapper } from './mappers/review-prisma.mapper';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaReviewRepository implements ReviewRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Review | null> {
        const row = await this.prisma.review.findUnique({ where: { id: id.value } });
        return row ? ReviewPrismaMapper.toDomain(row) : null;
    }

    async existsByOrderIdAndTarget(orderId: string, target: ReviewTarget): Promise<boolean> {
        const count = await this.prisma.review.count({
            where: { orderId, target: target as never },
        });
        return count > 0;
    }

    async findManyByRestaurantId(restaurantId: string, pagination: ReviewPagination): Promise<Review[]> {
        const { skip, take } = this.resolvePagination(pagination);
        const rows = await this.prisma.review.findMany({
            where: { restaurantId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
        return rows.map(ReviewPrismaMapper.toDomain);
    }

    async findManyByCourierId(courierId: string, pagination: ReviewPagination): Promise<Review[]> {
        const { skip, take } = this.resolvePagination(pagination);
        const rows = await this.prisma.review.findMany({
            where: { courierId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
        return rows.map(ReviewPrismaMapper.toDomain);
    }

    async findManyByReviewerUserId(reviewerUserId: string, pagination: ReviewPagination): Promise<Review[]> {
        const { skip, take } = this.resolvePagination(pagination);
        const rows = await this.prisma.review.findMany({
            where: { reviewerUserId },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
        return rows.map(ReviewPrismaMapper.toDomain);
    }

    async save(review: Review): Promise<void> {
        const data = ReviewPrismaMapper.toPersistence(review);
        await this.prisma.review.create({
            data: {
                id: data.id,
                orderId: data.orderId,
                reviewerUserId: data.reviewerUserId,
                customerId: data.customerId,
                target: data.target as never,
                restaurantId: data.restaurantId,
                courierId: data.courierId,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            },
        });
    }

    async update(review: Review): Promise<void> {
        const data = ReviewPrismaMapper.toPersistence(review);
        await this.prisma.review.update({
            where: { id: data.id },
            data: {
                rating: data.rating,
                comment: data.comment,
                updatedAt: data.updatedAt,
            },
        });
    }

    async delete(id: UUID): Promise<void> {
        await this.prisma.review.delete({ where: { id: id.value } });
    }

    async calculateRestaurantRating(restaurantId: string): Promise<ReviewRatingStats> {
        const result = await this.prisma.review.aggregate({
            where: { restaurantId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return {
            ratingAvg: result._avg.rating ?? 0,
            ratingCount: result._count.rating,
        };
    }

    async calculateCourierRating(courierId: string): Promise<ReviewRatingStats> {
        const result = await this.prisma.review.aggregate({
            where: { courierId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        return {
            ratingAvg: result._avg.rating ?? 0,
            ratingCount: result._count.rating,
        };
    }

    private resolvePagination(pagination: ReviewPagination): { skip: number; take: number } {
        const page = Math.max(1, pagination.page ?? DEFAULT_PAGE);
        const take = Math.min(MAX_LIMIT, Math.max(1, pagination.limit ?? DEFAULT_LIMIT));
        return { skip: (page - 1) * take, take };
    }
}
