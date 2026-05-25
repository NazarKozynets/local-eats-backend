import { CreateRestaurantReviewUseCase } from './create-restaurant-review.use-case';
import { OrderNotReviewableError } from '../../../domain/errors/order-not-reviewable.error';
import { OrderReviewAccessDeniedError } from '../../../domain/errors/order-review-access-denied.error';
import { ReviewAlreadyExistsError } from '../../../domain/errors/review-already-exists.error';
import { InvalidReviewRatingError } from '../../../domain/errors/invalid-review-rating.error';
import { RestaurantReviewCreatedEvent } from '../../../domain/events/restaurant-review-created.event';
import { RestaurantRatingUpdatedEvent } from '../../../domain/events/restaurant-rating-updated.event';
import {
    buildDeliveredOrderReadModel,
    TEST_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_ORDER_ID,
    TEST_RESTAURANT_ID,
    TEST_CUSTOMER_PROFILE_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockReviewRepository,
    createMockOrderReviewReader,
    createMockRestaurantRatingWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('CreateRestaurantReviewUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let orderReviewReader: ReturnType<typeof createMockOrderReviewReader>;
    let restaurantRatingWriter: ReturnType<typeof createMockRestaurantRatingWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateRestaurantReviewUseCase;

    const command = (overrides = {}) => ({
        currentUserId: TEST_USER_ID,
        orderId: TEST_ORDER_ID,
        rating: 4,
        comment: 'Great food!',
        ...overrides,
    });

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        orderReviewReader = createMockOrderReviewReader();
        restaurantRatingWriter = createMockRestaurantRatingWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateRestaurantReviewUseCase(
            reviewRepository,
            orderReviewReader,
            restaurantRatingWriter,
            eventPublisher,
        );

        orderReviewReader.findOrderForReview.mockResolvedValue(buildDeliveredOrderReadModel());
        reviewRepository.existsByOrderIdAndTarget.mockResolvedValue(false);
        reviewRepository.save.mockResolvedValue(undefined);
        reviewRepository.calculateRestaurantRating.mockResolvedValue({ ratingAvg: 4.0, ratingCount: 1 });
        restaurantRatingWriter.updateRating.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('creates restaurant review for delivered order owned by current customer', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(reviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('fails if order does not exist', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotReviewableError);
    });

    it('fails if order is not DELIVERED', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(
            buildDeliveredOrderReadModel({ status: 'ACCEPTED_BY_RESTAURANT' }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotReviewableError);
    });

    it('fails if current user does not own the order', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(
            buildDeliveredOrderReadModel({ reviewerUserId: TEST_OTHER_USER_ID }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderReviewAccessDeniedError);
    });

    it('fails if restaurant review already exists for this order', async () => {
        reviewRepository.existsByOrderIdAndTarget.mockResolvedValue(true);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
    });

    it('fails for invalid rating below 1', async () => {
        await expect(useCase.execute(command({ rating: 0 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('fails for invalid rating above 5', async () => {
        await expect(useCase.execute(command({ rating: 6 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('fails for non-integer rating', async () => {
        await expect(useCase.execute(command({ rating: 3.5 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('recalculates restaurant rating after creation', async () => {
        await useCase.execute(command());
        expect(reviewRepository.calculateRestaurantRating).toHaveBeenCalledWith(TEST_RESTAURANT_ID);
    });

    it('calls RestaurantRatingWriter with computed stats', async () => {
        reviewRepository.calculateRestaurantRating.mockResolvedValue({ ratingAvg: 4.5, ratingCount: 2 });
        await useCase.execute(command());
        expect(restaurantRatingWriter.updateRating).toHaveBeenCalledWith(TEST_RESTAURANT_ID, 4.5, 2);
    });

    it('publishes RestaurantReviewCreatedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantReviewCreatedEvent)]),
        );
    });

    it('publishes RestaurantRatingUpdatedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantRatingUpdatedEvent)]),
        );
    });

    it('saves review with correct reviewer and customer ids', async () => {
        await useCase.execute(command());
        const saved = reviewRepository.save.mock.calls[0][0];
        expect(saved.reviewerUserId.value).toBe(TEST_USER_ID);
        expect(saved.customerId.value).toBe(TEST_CUSTOMER_PROFILE_ID);
        expect(saved.restaurantId?.value).toBe(TEST_RESTAURANT_ID);
    });

    it('creates review with null comment when not provided', async () => {
        await useCase.execute(command({ comment: null }));
        const saved = reviewRepository.save.mock.calls[0][0];
        expect(saved.comment).toBeNull();
    });
});
