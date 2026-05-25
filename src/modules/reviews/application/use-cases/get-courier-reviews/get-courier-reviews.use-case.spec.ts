import { GetCourierReviewsUseCase } from './get-courier-reviews.use-case';
import { buildCourierReview } from '../../../__tests__/_helpers/builders';
import { createMockReviewRepository } from '../../../__tests__/_helpers/mocks';

const TEST_COURIER_ID = 'aa0e8400-e29b-41d4-a716-446655440005';
const OTHER_COURIER_ID = 'dd0e8400-e29b-41d4-a716-446655440008';

describe('GetCourierReviewsUseCase', () => {
    let reviewRepository: ReturnType<typeof createMockReviewRepository>;
    let useCase: GetCourierReviewsUseCase;

    beforeEach(() => {
        reviewRepository = createMockReviewRepository();
        useCase = new GetCourierReviewsUseCase(reviewRepository);
    });

    it('returns courier reviews for the given courier', async () => {
        const reviews = [buildCourierReview(), buildCourierReview()];
        reviewRepository.findManyByCourierId.mockResolvedValue(reviews);

        const result = await useCase.execute({ courierId: TEST_COURIER_ID });

        expect(result).toHaveLength(2);
        expect(reviewRepository.findManyByCourierId).toHaveBeenCalledWith(
            TEST_COURIER_ID,
            expect.any(Object),
        );
    });

    it('does not return restaurant reviews', async () => {
        const courierReviews = [buildCourierReview()];
        reviewRepository.findManyByCourierId.mockResolvedValue(courierReviews);

        const result = await useCase.execute({ courierId: TEST_COURIER_ID });

        expect(result.every(r => r.isForCourier())).toBe(true);
    });

    it('does not return reviews for another courier', async () => {
        reviewRepository.findManyByCourierId.mockImplementation(async (courierId) => {
            if (courierId !== TEST_COURIER_ID) return [];
            return [buildCourierReview()];
        });

        const result = await useCase.execute({ courierId: OTHER_COURIER_ID });

        expect(result).toHaveLength(0);
    });

    it('passes pagination to repository', async () => {
        reviewRepository.findManyByCourierId.mockResolvedValue([]);

        await useCase.execute({ courierId: TEST_COURIER_ID, page: 3, limit: 5 });

        expect(reviewRepository.findManyByCourierId).toHaveBeenCalledWith(
            TEST_COURIER_ID,
            { page: 3, limit: 5 },
        );
    });

    it('returns empty array when no reviews exist', async () => {
        reviewRepository.findManyByCourierId.mockResolvedValue([]);
        const result = await useCase.execute({ courierId: TEST_COURIER_ID });
        expect(result).toHaveLength(0);
    });
});
