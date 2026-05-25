import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { ReviewTarget } from '../enums/review-target.enum';
import { InvalidReviewRatingError } from '../errors/invalid-review-rating.error';
import { InvalidReviewCommentError } from '../errors/invalid-review-comment.error';

const RATING_MIN = 1;
const RATING_MAX = 5;
const COMMENT_MAX_LENGTH = 1000;

type ReviewProps = {
    id: UUID;
    orderId: UUID;
    reviewerUserId: UUID;
    customerId: UUID;
    target: ReviewTarget;
    restaurantId: UUID | null;
    courierId: UUID | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type CreateRestaurantReviewProps = {
    id: UUID;
    orderId: UUID;
    reviewerUserId: UUID;
    customerId: UUID;
    restaurantId: UUID;
    rating: number;
    comment: string | null;
};

type CreateCourierReviewProps = {
    id: UUID;
    orderId: UUID;
    reviewerUserId: UUID;
    customerId: UUID;
    courierId: UUID;
    rating: number;
    comment: string | null;
};

export class Review {
    private constructor(private readonly props: ReviewProps) {}

    static createRestaurantReview(p: CreateRestaurantReviewProps): Review {
        Review.validateRating(p.rating);
        if (p.comment !== null) {
            Review.validateComment(p.comment);
        }

        const now = new Date();
        return new Review({
            id: p.id,
            orderId: p.orderId,
            reviewerUserId: p.reviewerUserId,
            customerId: p.customerId,
            target: ReviewTarget.RESTAURANT,
            restaurantId: p.restaurantId,
            courierId: null,
            rating: p.rating,
            comment: p.comment,
            createdAt: now,
            updatedAt: now,
        });
    }

    static createCourierReview(p: CreateCourierReviewProps): Review {
        Review.validateRating(p.rating);
        if (p.comment !== null) {
            Review.validateComment(p.comment);
        }

        const now = new Date();
        return new Review({
            id: p.id,
            orderId: p.orderId,
            reviewerUserId: p.reviewerUserId,
            customerId: p.customerId,
            target: ReviewTarget.COURIER,
            restaurantId: null,
            courierId: p.courierId,
            rating: p.rating,
            comment: p.comment,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: ReviewProps): Review {
        return new Review(props);
    }

    updateRating(rating: number): void {
        Review.validateRating(rating);
        this.props.rating = rating;
        this.touch();
    }

    updateComment(comment: string | null): void {
        if (comment !== null) {
            Review.validateComment(comment);
        }
        this.props.comment = comment;
        this.touch();
    }

    belongsToReviewer(userId: string): boolean {
        return this.props.reviewerUserId.value === userId;
    }

    isForRestaurant(): boolean {
        return this.props.target === ReviewTarget.RESTAURANT;
    }

    isForCourier(): boolean {
        return this.props.target === ReviewTarget.COURIER;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    private static validateRating(rating: number): void {
        if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
            throw new InvalidReviewRatingError(rating);
        }
    }

    private static validateComment(comment: string): void {
        const trimmed = comment.trim();
        if (!trimmed) {
            throw new InvalidReviewCommentError('comment must not be empty');
        }
        if (trimmed.length > COMMENT_MAX_LENGTH) {
            throw new InvalidReviewCommentError(
                `comment must not exceed ${COMMENT_MAX_LENGTH} characters`,
            );
        }
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get reviewerUserId(): UUID { return this.props.reviewerUserId; }
    get customerId(): UUID { return this.props.customerId; }
    get target(): ReviewTarget { return this.props.target; }
    get restaurantId(): UUID | null { return this.props.restaurantId; }
    get courierId(): UUID | null { return this.props.courierId; }
    get rating(): number { return this.props.rating; }
    get comment(): string | null { return this.props.comment; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
