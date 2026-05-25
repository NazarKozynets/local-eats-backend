import type { Review } from '../../domain/entities/review.entity';
import type { ReviewTarget } from '../../domain/enums/review-target.enum';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export type ReviewPagination = {
    page?: number;
    limit?: number;
};

export type ReviewRatingStats = {
    ratingAvg: number;
    ratingCount: number;
};

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

export interface ReviewRepository {
    findById(id: UUID): Promise<Review | null>;
    existsByOrderIdAndTarget(orderId: string, target: ReviewTarget): Promise<boolean>;
    findManyByRestaurantId(restaurantId: string, pagination: ReviewPagination): Promise<Review[]>;
    findManyByCourierId(courierId: string, pagination: ReviewPagination): Promise<Review[]>;
    findManyByReviewerUserId(reviewerUserId: string, pagination: ReviewPagination): Promise<Review[]>;
    save(review: Review): Promise<void>;
    update(review: Review): Promise<void>;
    delete(id: UUID): Promise<void>;
    calculateRestaurantRating(restaurantId: string): Promise<ReviewRatingStats>;
    calculateCourierRating(courierId: string): Promise<ReviewRatingStats>;
}
