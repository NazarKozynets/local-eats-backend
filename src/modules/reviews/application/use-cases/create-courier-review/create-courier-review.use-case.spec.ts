import { CreateCourierReviewUseCase } from './create-courier-review.use-case';
import { OrderNotReviewableError } from '../../../domain/errors/order-not-reviewable.error';
import { OrderReviewAccessDeniedError } from '../../../domain/errors/order-review-access-denied.error';
import { ReviewAlreadyExistsError } from '../../../domain/errors/review-already-exists.error';
import { CourierNotAssignedToOrderError } from '../../../domain/errors/courier-not-assigned-to-order.error';
import { InvalidReviewRatingError } from '../../../domain/errors/invalid-review-rating.error';
import { CourierReviewCreatedEvent } from '../../../domain/events/courier-review-created.event';
import { CourierRatingUpdatedEvent } from '../../../domain/events/courier-rating-updated.event';
import {
    buildDeliveredOrderReadModel,
    TEST_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_ORDER_ID,
    TEST_COURIER_ID,
    TEST_CUSTOMER_PROFILE_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockReviewRepository,
    createMockOrderReviewReader,
    createMockCourierRatingWriter,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('CreateCourierReviewUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let orderReviewReader: ReturnType<typeof createMockOrderReviewReader>;
    let courierRatingWriter: ReturnType<typeof createMockCourierRatingWriter>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateCourierReviewUseCase;

    const command = (overrides = {}) => ({
        currentUserId: TEST_USER_ID,
        orderId: TEST_ORDER_ID,
        rating: 5,
        comment: 'Fast delivery!',
        ...overrides,
    });

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        orderReviewReader = createMockOrderReviewReader();
        courierRatingWriter = createMockCourierRatingWriter();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateCourierReviewUseCase(
            reviewRepository,
            orderReviewReader,
            courierRatingWriter,
            eventPublisher,
        );

        orderReviewReader.findOrderForReview.mockResolvedValue(buildDeliveredOrderReadModel());
        reviewRepository.existsByOrderIdAndTarget.mockResolvedValue(false);
        reviewRepository.save.mockResolvedValue(undefined);
        reviewRepository.calculateCourierRating.mockResolvedValue({ ratingAvg: 5.0, ratingCount: 1 });
        courierRatingWriter.updateRating.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('creates courier review for delivered order owned by current customer', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(reviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('fails if order does not exist', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotReviewableError);
    });

    it('fails if order is not DELIVERED', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(
            buildDeliveredOrderReadModel({ status: 'PREPARING' }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderNotReviewableError);
    });

    it('fails if current user does not own the order', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(
            buildDeliveredOrderReadModel({ reviewerUserId: TEST_OTHER_USER_ID }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(OrderReviewAccessDeniedError);
    });

    it('fails if order has no courier assigned', async () => {
        orderReviewReader.findOrderForReview.mockResolvedValue(
            buildDeliveredOrderReadModel({ courierId: null }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierNotAssignedToOrderError);
    });

    it('fails if courier review already exists for this order', async () => {
        reviewRepository.existsByOrderIdAndTarget.mockResolvedValue(true);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
    });

    it('fails for invalid rating below 1', async () => {
        await expect(useCase.execute(command({ rating: 0 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('fails for invalid rating above 5', async () => {
        await expect(useCase.execute(command({ rating: 6 }))).rejects.toBeInstanceOf(InvalidReviewRatingError);
    });

    it('recalculates courier rating after creation', async () => {
        await useCase.execute(command());
        expect(reviewRepository.calculateCourierRating).toHaveBeenCalledWith(TEST_COURIER_ID);
    });

    it('calls CourierRatingWriter with computed stats', async () => {
        reviewRepository.calculateCourierRating.mockResolvedValue({ ratingAvg: 4.8, ratingCount: 5 });
        await useCase.execute(command());
        expect(courierRatingWriter.updateRating).toHaveBeenCalledWith(TEST_COURIER_ID, 4.8, 5);
    });

    it('publishes CourierReviewCreatedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierReviewCreatedEvent)]),
        );
    });

    it('publishes CourierRatingUpdatedEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierRatingUpdatedEvent)]),
        );
    });

    it('saves review with correct courier id', async () => {
        await useCase.execute(command());
        const saved = reviewRepository.save.mock.calls[0][0];
        expect(saved.courierId?.value).toBe(TEST_COURIER_ID);
        expect(saved.customerId.value).toBe(TEST_CUSTOMER_PROFILE_ID);
        expect(saved.restaurantId).toBeNull();
    });
});
