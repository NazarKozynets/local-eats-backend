import { GetAdminDeliveryProblemsUseCase } from './get-admin-delivery-problems.use-case';
import { createMockAdminDeliveryProblemReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminDeliveryProblem } from '../../../__tests__/_helpers/builders';

describe('GetAdminDeliveryProblemsUseCase', () => {
    let deliveryProblemReader: ReturnType<typeof createMockAdminDeliveryProblemReader>;
    let useCase: GetAdminDeliveryProblemsUseCase;

    beforeEach(() => {
        deliveryProblemReader = createMockAdminDeliveryProblemReader();
        useCase = new GetAdminDeliveryProblemsUseCase(deliveryProblemReader);
    });

    it('returns delivery problems from reader with filters', async () => {
        const problems = [buildAdminDeliveryProblem()];
        deliveryProblemReader.findMany.mockResolvedValue(problems);
        const command = { page: 1, limit: 20, status: 'OPEN' };

        const result = await useCase.execute(command);

        expect(result).toEqual(problems);
        expect(deliveryProblemReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no delivery problems match', async () => {
        deliveryProblemReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({ status: 'RESOLVED' });

        expect(result).toEqual([]);
    });
});
