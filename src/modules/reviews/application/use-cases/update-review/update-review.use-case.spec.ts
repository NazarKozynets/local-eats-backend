import { UpdateReviewUseCase } from './update-review.use-case';
import { ReviewNotFoundError } from '../../../domain/errors/review-not-found.error';
import { ReviewAccessDeniedError } from '../../../domain/errors/review-access-denied.error';
import { InvalidReviewRatingError } from '../../../domain/errors/invalid-review-rating.error';
import { ReviewUpdatedEvent } from '../../../domain/events/review-updated.event';
import { RestaurantRatingUpdatedEvent } from '../../../domain/events/restaurant-rating-updated.event';
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

describe('UpdateReviewUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let restaurantRatingWriter: ReturnType<typeof createMockRestaurantRatingWriter>;
    let courierRatingWriter: ReturnType<typeof createMockCourierRatingWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateReviewUseCase;

    const command = (overrides = {}) => ({
        currentUserId: TEST_USER_ID,
        reviewId: TEST_REVIEW_ID,
        rating: 3,
        ...overrides,
    });

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        restaurantRatingWriter = createMockRestaurantRatingWriter();
        courierRatingWriter = createMockCourierRatingWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateReviewUseCase(
            reviewRepository,
            restaurantRatingWriter,
            courierRatingWriter,
            eventPublisher,
        );

        reviewRepository.findById.mockResolvedValue(buildRestaurantReview());
        reviewRepository.update.mockResolvedValue(undefined);
        reviewRepository.calculateRestaurantRating.mockResolvedValue({ ratingAvg: 3.0, ratingCount: 1 });
        restaurantRatingWriter.updateRating.mockResolvedValue(undefined);
        courierRatingWriter.updateRating.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('owner can update rating', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(reviewRepository.update).toHaveBeenCalledTimes(1);
    });

    it('fails if review does not exist', async () => {
        reviewRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ReviewNotFoundError);
    });

    it('fails if unrelated user tries to update', async () => {
        await expect(useCase.execute(command({ currentUserId: TEST_OTHER_USER_ID }))).rejects.toBeInstanceOf(
            ReviewAccessDeniedError,
        );
    });

    it('fails if invalid rating is provided', async () => {
        await expect(useCase.execute(command({ rating: 10 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('recalculates restaurant rating when rating changes', async () => {
        await useCase.execute(command({ rating: 3 }));
        expect(reviewRepository.calculateRestaurantRating).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
        expect(restaurantRatingWriter.updateRating).toHaveBeenCalled();
    });

    it('recalculates courier rating when courier review rating changes', async () => {
        reviewRepository.findById.mockResolvedValue(buildCourierReview({ rating: 5 }));
        reviewRepository.calculateCourierRating.mockResolvedValue({ ratingAvg: 4.0, ratingCount: 2 });

        await useCase.execute(command({ rating: 3 }));

        expect(reviewRepository.calculateCourierRating).toHaveBeenCalledWith(TEST_COURIER_ID);
        expect(courierRatingWriter.updateRating).toHaveBeenCalled();
    });

    it('publishes ReviewUpdatedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(ReviewUpdatedEvent)]),
        );
    });

    it('publishes RestaurantRatingUpdatedEvent when rating changes', async () => {
        await useCase.execute(command({ rating: 3 }));
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantRatingUpdatedEvent)]),
        );
    });

    it('does not recalculate rating if rating unchanged', async () => {
        const review = buildRestaurantReview({ rating: 4 });
        reviewRepository.findById.mockResolvedValue(review);

        await useCase.execute(command({ rating: 4 }));

        expect(reviewRepository.calculateRestaurantRating).not.toHaveBeenCalled();
        expect(restaurantRatingWriter.updateRating).not.toHaveBeenCalled();
    });
});
