import { GetMyReviewsUseCase } from './get-my-reviews.use-case';
import { buildRestaurantReview, buildCourierReview, TEST_USER_ID } from '../../../__tests__/_helpers/builders';
import { createMockReviewRepository } from '../../../__tests__/_helpers/mocks';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';

const OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

describe('GetMyReviewsUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let useCase: GetMyReviewsUseCase;

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        useCase = new GetMyReviewsUseCase(reviewRepository);
    });

    it('returns reviews created by current user', async () => {
        const reviews = [buildRestaurantReview(), buildCourierReview()];
        reviewRepository.findManyByReviewerUserId.mockResolvedValue(reviews);

        const result = await useCase.execute({ currentUserId: TEST_USER_ID });

        expect(result).toHaveLength(2);
        expect(reviewRepository.findManyByReviewerUserId).toHaveBeenCalledWith(
            TEST_USER_ID,
            expect.any(Object),
        );
    });

    it('does not return other users reviews', async () => {
        reviewRepository.findManyByReviewerUserId.mockImplementation(async (userId) => {
            if (userId !== TEST_USER_ID) return [];
            return [buildRestaurantReview()];
        });

        const result = await useCase.execute({ currentUserId: OTHER_USER_ID });

        expect(result).toHaveLength(0);
    });

    it('passes pagination to repository', async () => {
        reviewRepository.findManyByReviewerUserId.mockResolvedValue([]);

        await useCase.execute({ currentUserId: TEST_USER_ID, page: 2, limit: 15 });

        expect(reviewRepository.findManyByReviewerUserId).toHaveBeenCalledWith(
            TEST_USER_ID,
            { page: 2, limit: 15 },
        );
    });

    it('returns empty array when user has no reviews', async () => {
        reviewRepository.findManyByReviewerUserId.mockResolvedValue([]);
        const result = await useCase.execute({ currentUserId: TEST_USER_ID });
        expect(result).toHaveLength(0);
    });
});
