import { DeleteReviewUseCase } from './delete-review.use-case';
import { ReviewNotFoundError } from '../../../domain/errors/review-not-found.error';
import { ReviewAccessDeniedError } from '../../../domain/errors/review-access-denied.error';
import { ReviewDeletedEvent } from '../../../domain/events/review-deleted.event';
import { RestaurantRatingUpdatedEvent } from '../../../domain/events/restaurant-rating-updated.event';
import { CourierRatingUpdatedEvent } from '../../../domain/events/courier-rating-updated.event';
import {
    buildRestaurantReview,
    buildCourierReview,
    TEST_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_REVIEW_ID,
    TEST_RESTAURANT_ID,
    TEST_COURIER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockReviewRepository,
    createMockRestaurantRatingWriter,
    createMockCourierRatingWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('DeleteReviewUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let restaurantRatingWriter: ReturnType<typeof createMockRestaurantRatingWriter>;
    let courierRatingWriter: ReturnType<typeof createMockCourierRatingWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: DeleteReviewUseCase;

    const command = (overrides = {}) => ({
        currentUserId: TEST_USER_ID,
        reviewId: TEST_REVIEW_ID,
        ...overrides,
    });

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        restaurantRatingWriter = createMockRestaurantRatingWriter();
        courierRatingWriter = createMockCourierRatingWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new DeleteReviewUseCase(
            reviewRepository,
            restaurantRatingWriter,
            courierRatingWriter,
            eventPublisher,
        );

        reviewRepository.findById.mockResolvedValue(buildRestaurantReview());
        reviewRepository.delete.mockResolvedValue(undefined);
        reviewRepository.calculateRestaurantRating.mockResolvedValue({ ratingAvg: 0, ratingCount: 0 });
        restaurantRatingWriter.updateRating.mockResolvedValue(undefined);
        courierRatingWriter.updateRating.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('owner can delete own review', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(reviewRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('fails if review does not exist', async () => {
        reviewRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ReviewNotFoundError);
    });

    it('fails if unrelated user tries to delete', async () => {
        await expect(useCase.execute(command({ currentUserId: TEST_OTHER_USER_ID }))).rejects.toBeInstanceOf(
            ReviewAccessDeniedError,
        );
    });

    it('recalculates restaurant rating after deleting restaurant review', async () => {
        await useCase.execute(command());
        expect(reviewRepository.calculateRestaurantRating).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
        expect(restaurantRatingWriter.updateRating).toHaveBeenCalledWith(TEST_RESTAURANT_ID, 0, 0);
    });

    it('recalculates courier rating after deleting courier review', async () => {
        reviewRepository.findById.mockResolvedValue(buildCourierReview());
        reviewRepository.calculateCourierRating.mockResolvedValue({ ratingAvg: 0, ratingCount: 0 });

        await useCase.execute(command());

        expect(reviewRepository.calculateCourierRating).toHaveBeenCalledWith(TEST_COURIER_ID);
        expect(courierRatingWriter.updateRating).toHaveBeenCalledWith(TEST_COURIER_ID, 0, 0);
    });

    it('publishes ReviewDeletedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(ReviewDeletedEvent)]),
        );
    });

    it('publishes RestaurantRatingUpdatedEvent after deleting restaurant review', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantRatingUpdatedEvent)]),
        );
    });

    it('publishes CourierRatingUpdatedEvent after deleting courier review', async () => {
        reviewRepository.findById.mockResolvedValue(buildCourierReview());
        reviewRepository.calculateCourierRating.mockResolvedValue({ ratingAvg: 0, ratingCount: 0 });

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierRatingUpdatedEvent)]),
        );
    });
});
