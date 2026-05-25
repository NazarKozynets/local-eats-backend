import { GetAdminReviewsUseCase } from './get-admin-reviews.use-case';
import { createMockAdminReviewReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminReview } from '../../../__tests__/_helpers/builders';

describe('GetAdminReviewsUseCase', () => {
    let reviewReader: ReturnType<typeof createMockAdminReviewReader>;
    let useCase: GetAdminReviewsUseCase;

    beforeEach(() => {
        reviewReader = createMockAdminReviewReader();
        useCase = new GetAdminReviewsUseCase(reviewReader);
    });

    it('returns reviews from reader with filters', async () => {
        const reviews = [buildAdminReview()];
        reviewReader.findMany.mockResolvedValue(reviews);
        const command = { page: 1, limit: 20, target: 'RESTAURANT' };

        const result = await useCase.execute(command);

        expect(result).toEqual(reviews);
        expect(reviewReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no reviews match', async () => {
        reviewReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ target: 'COURIER' });

        expect(result).toEqual([]);
    });
});
