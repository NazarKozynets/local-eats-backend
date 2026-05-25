import { ResolveDeliveryProblemUseCase } from './resolve-delivery-problem.use-case';
import { DeliveryProblemNotFoundError } from '../../../domain/errors/delivery-problem-not-found.error';
import { DeliveryProblemAlreadyResolvedError } from '../../../domain/errors/delivery-problem-already-resolved.error';
import {
    createMockAdminDeliveryProblemReader,
    createMockAdminDeliveryProblemActions,
} from '../../../__tests__/_helpers/mocks';
import { buildAdminDeliveryProblem, TEST_PROBLEM_ID } from '../../../__tests__/_helpers/builders';

describe('ResolveDeliveryProblemUseCase', () => {
    let deliveryProblemReader: ReturnType<typeof createMockAdminDeliveryProblemReader>;
    let deliveryProblemActions: ReturnType<typeof createMockAdminDeliveryProblemActions>;
    let useCase: ResolveDeliveryProblemUseCase;

    const command = { problemId: TEST_PROBLEM_ID };

    beforeEach(() => {
        deliveryProblemReader = createMockAdminDeliveryProblemReader();
        deliveryProblemActions = createMockAdminDeliveryProblemActions();
        useCase = new ResolveDeliveryProblemUseCase(deliveryProblemReader, deliveryProblemActions);

        deliveryProblemReader.findById.mockResolvedValue(buildAdminDeliveryProblem({ status: 'OPEN' }));
        deliveryProblemActions.resolve.mockResolvedValue(undefined);
    });

    it('throws if delivery problem does not exist', async () => {
        deliveryProblemReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command)).rejects.toBeInstanceOf(DeliveryProblemNotFoundError);
    });

    it('throws if delivery problem is already resolved', async () => {
        deliveryProblemReader.findById.mockResolvedValue(buildAdminDeliveryProblem({ status: 'RESOLVED' }));
        await expect(useCase.execute(command)).rejects.toBeInstanceOf(DeliveryProblemAlreadyResolvedError);
    });

    it('resolves an open delivery problem', async () => {
        await expect(useCase.execute(command)).resolves.not.toThrow();
        expect(deliveryProblemActions.resolve).toHaveBeenCalledWith(TEST_PROBLEM_ID, expect.any(Date));
    });

    it('looks up the problem by id before resolving', async () => {
        await useCase.execute(command);
        expect(deliveryProblemReader.findById).toHaveBeenCalledWith(TEST_PROBLEM_ID);
    });
});
