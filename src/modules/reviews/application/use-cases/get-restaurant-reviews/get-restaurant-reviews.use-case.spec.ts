import { GetRestaurantReviewsUseCase } from './get-restaurant-reviews.use-case';
import {
    buildRestaurantReview,
    buildCourierReview,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import { createMockReviewRepository } from '../../../__tests__/_helpers/mocks';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';

const OTHER_RESTAURANT_ID = 'cc0e8400-e29b-41d4-a716-446655440007';

describe('GetRestaurantReviewsUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let useCase: GetRestaurantReviewsUseCase;

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        useCase = new GetRestaurantReviewsUseCase(reviewRepository);
    });

    it('returns restaurant reviews for the given restaurant', async () => {
        const reviews = [buildRestaurantReview(), buildRestaurantReview()];
        reviewRepository.findManyByRestaurantId.mockResolvedValue(reviews);

        const result = await useCase.execute({ restaurantId: TEST_RESTAURANT_ID });

        expect(result).toHaveLength(2);
        expect(reviewRepository.findManyByRestaurantId).toHaveBeenCalledWith(
            TEST_RESTAURANT_ID,
            expect.any(Object),
        );
    });

    it('does not return courier reviews', async () => {
        const restaurantReviews = [buildRestaurantReview()];
        reviewRepository.findManyByRestaurantId.mockResolvedValue(restaurantReviews);

        const result = await useCase.execute({ restaurantId: TEST_RESTAURANT_ID });

        expect(result.every(r => r.isForRestaurant())).toBe(true);
    });

    it('does not return reviews for another restaurant', async () => {
        reviewRepository.findManyByRestaurantId.mockImplementation(async (restaurantId) => {
            if (restaurantId !== TEST_RESTAURANT_ID) return [];
            return [buildRestaurantReview()];
        });

        const result = await useCase.execute({ restaurantId: OTHER_RESTAURANT_ID });

        expect(result).toHaveLength(0);
    });

    it('passes pagination to repository', async () => {
        reviewRepository.findManyByRestaurantId.mockResolvedValue([]);

        await useCase.execute({ restaurantId: TEST_RESTAURANT_ID, page: 2, limit: 10 });

        expect(reviewRepository.findManyByRestaurantId).toHaveBeenCalledWith(
            TEST_RESTAURANT_ID,
            { page: 2, limit: 10 },
        );
    });

    it('returns empty array when no reviews exist', async () => {
        reviewRepository.findManyByRestaurantId.mockResolvedValue([]);
        const result = await useCase.execute({ restaurantId: TEST_RESTAURANT_ID });
        expect(result).toHaveLength(0);
    });
});
