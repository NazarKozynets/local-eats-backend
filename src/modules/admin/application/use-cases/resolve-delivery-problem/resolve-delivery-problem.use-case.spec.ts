import { ResolveDeliveryProblemUseCase } from './resolve-delivery-problem.use-case';
import { DeliveryProblemNotFoundError } from '../../../domain/errors/delivery-problem-not-found.error';
import { DeliveryProblemAlreadyResolvedError } from '../../../domain/errors/delivery-problem-already-resolved.error';
import {
    createMockAdminDeliveryProblemReader,
    createMockAdminDeliveryProblemActions,
} from '../../../__tests__/_helpers/mocks';
import { buildAdminDeliveryProblem, TEST_PROBLEM_ID } from '../../../__tests__/_helpers/builders';
import type { DomainEventPublisher } from '../../../../../shared/domain/events/domain-event-publisher.port';

const TEST_ADMIN_USER_ID = '550e8400-e29b-41d4-a716-446655440099';

describe('ResolveDeliveryProblemUseCase', () => {
    let deliveryProblemReader: ReturnType<typeof createMockAdminDeliveryProblemReader>;
    let deliveryProblemActions: ReturnType<typeof createMockAdminDeliveryProblemActions>;
    let eventPublisher: jest.Mocked<DomainEventPublisher>;
    let useCase: ResolveDeliveryProblemUseCase;

    const command = { problemId: TEST_PROBLEM_ID, adminUserId: TEST_ADMIN_USER_ID };

    beforeEach(() => {
        deliveryProblemReader = createMockAdminDeliveryProblemReader();
        deliveryProblemActions = createMockAdminDeliveryProblemActions();
        eventPublisher = { publishAll: jest.fn().mockResolvedValue(undefined) };
        useCase = new ResolveDeliveryProblemUseCase(deliveryProblemReader, deliveryProblemActions, eventPublisher);

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

    it('publishes DeliveryProblemResolvedEvent after resolving', async () => {
        await useCase.execute(command);
        expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);
        const [events] = eventPublisher.publishAll.mock.calls[0];
        expect(events).toHaveLength(1);
        expect(events[0].constructor.name).toBe('DeliveryProblemResolvedEvent');
    });
});
