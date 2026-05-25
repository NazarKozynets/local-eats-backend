import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Review } from '../../../domain/entities/review.entity';
import { ReviewTarget } from '../../../domain/enums/review-target.enum';

type PrismaReviewRow = {
    id: string;
    orderId: string;
    reviewerUserId: string;
    customerId: string;
    target: string;
    restaurantId: string | null;
    courierId: string | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export class ReviewPrismaMapper {
    static toDomain(raw: PrismaReviewRow): Review {
        return Review.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            reviewerUserId: UUID.create(raw.reviewerUserId),
            customerId: UUID.create(raw.customerId),
            target: raw.target as ReviewTarget,
            restaurantId: raw.restaurantId ? UUID.create(raw.restaurantId) : null,
            courierId: raw.courierId ? UUID.create(raw.courierId) : null,
            rating: raw.rating,
            comment: raw.comment ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(review: Review) {
        return {
            id: review.id.value,
            orderId: review.orderId.value,
            reviewerUserId: review.reviewerUserId.value,
            customerId: review.customerId.value,
            target: review.target,
            restaurantId: review.restaurantId?.value ?? null,
            courierId: review.courierId?.value ?? null,
            rating: review.rating,
            comment: review.comment ?? null,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    }
}
