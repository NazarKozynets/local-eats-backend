import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { Review } from '../../domain/entities/review.entity';
import { ReviewTarget } from '../../domain/enums/review-target.enum';
import type { OrderReviewReadModel } from '../../application/ports/order-review-reader.port';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_REVIEW_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_ORDER_ID = '880e8400-e29b-41d4-a716-446655440003';
export const TEST_RESTAURANT_ID = '990e8400-e29b-41d4-a716-446655440004';
export const TEST_COURIER_ID = 'aa0e8400-e29b-41d4-a716-446655440005';
export const TEST_CUSTOMER_PROFILE_ID = 'bb0e8400-e29b-41d4-a716-446655440006';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

export function buildDeliveredOrderReadModel(
    overrides: Partial<OrderReviewReadModel> = {},
): OrderReviewReadModel {
    return {
        orderId: TEST_ORDER_ID,
        status: 'DELIVERED',
        customerId: TEST_CUSTOMER_PROFILE_ID,
        reviewerUserId: TEST_USER_ID,
        restaurantId: TEST_RESTAURANT_ID,
        courierId: TEST_COURIER_ID,
        ...overrides,
    };
}

type BuildReviewOverrides = Partial<{
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
}>;

export function buildRestaurantReview(overrides: BuildReviewOverrides = {}): Review {
    return Review.restore({
        id: overrides.id ?? UUID.create(TEST_REVIEW_ID),
        orderId: overrides.orderId ?? UUID.create(TEST_ORDER_ID),
        reviewerUserId: overrides.reviewerUserId ?? UUID.create(TEST_USER_ID),
        customerId: overrides.customerId ?? UUID.create(TEST_CUSTOMER_PROFILE_ID),
        target: overrides.target ?? ReviewTarget.RESTAURANT,
        restaurantId: overrides.restaurantId !== undefined
            ? overrides.restaurantId
            : UUID.create(TEST_RESTAURANT_ID),
        courierId: overrides.courierId !== undefined ? overrides.courierId : null,
        rating: overrides.rating ?? 4,
        comment: overrides.comment !== undefined ? overrides.comment : 'Great food!',
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

export function buildCourierReview(overrides: BuildReviewOverrides = {}): Review {
    return Review.restore({
        id: overrides.id ?? UUID.create(TEST_REVIEW_ID),
        orderId: overrides.orderId ?? UUID.create(TEST_ORDER_ID),
        reviewerUserId: overrides.reviewerUserId ?? UUID.create(TEST_USER_ID),
        customerId: overrides.customerId ?? UUID.create(TEST_CUSTOMER_PROFILE_ID),
        target: overrides.target ?? ReviewTarget.COURIER,
        restaurantId: overrides.restaurantId !== undefined ? overrides.restaurantId : null,
        courierId: overrides.courierId !== undefined
            ? overrides.courierId
            : UUID.create(TEST_COURIER_ID),
        rating: overrides.rating ?? 5,
        comment: overrides.comment !== undefined ? overrides.comment : 'Fast delivery!',
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}
