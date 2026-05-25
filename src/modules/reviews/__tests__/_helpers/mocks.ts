import type { ReviewRepository } from '../../application/ports/review.repository.port';
import type { OrderReviewReader } from '../../application/ports/order-review-reader.port';
import type { RestaurantRatingWriter } from '../../application/ports/restaurant-rating-writer.port';
import type { CourierRatingWriter } from '../../application/ports/courier-rating-writer.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockReviewRepository(): jest.Mocked<ReviewRepository> {
    return {
        findById: jest.fn(),
        existsByOrderIdAndTarget: jest.fn(),
        findManyByRestaurantId: jest.fn(),
        findManyByCourierId: jest.fn(),
        findManyByReviewerUserId: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        calculateRestaurantRating: jest.fn(),
        calculateCourierRating: jest.fn(),
    };
}

export function createMockOrderReviewReader(): jest.Mocked<OrderReviewReader> {
    return {
        findOrderForReview: jest.fn(),
    };
}

export function createMockRestaurantRatingWriter(): jest.Mocked<RestaurantRatingWriter> {
    return {
        updateRating: jest.fn(),
    };
}

export function createMockCourierRatingWriter(): jest.Mocked<CourierRatingWriter> {
    return {
        updateRating: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
