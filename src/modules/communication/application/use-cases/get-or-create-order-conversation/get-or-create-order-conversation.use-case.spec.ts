import { GetOrCreateOrderConversationUseCase } from './get-or-create-order-conversation.use-case';
import { OrderNotFoundForConversationError } from '../../../domain/errors/order-not-found-for-conversation.error';
import { OrderConversationAccessDeniedError } from '../../../domain/errors/order-conversation-access-denied.error';
import { ConversationCreatedEvent } from '../../../domain/events/conversation-created.event';
import {
    buildConversation,
    buildOrderReadModel,
    TEST_CUSTOMER_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_ORDER_ID,
    TEST_COURIER_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockConversationRepository,
    createMockOrderCommunicationReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('GetOrCreateOrderConversationUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let orderReader: ReturnType<typeof createMockOrderCommunicationReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: GetOrCreateOrderConversationUseCase;

    const command = (overrides = {}) => ({
        orderId: TEST_ORDER_ID,
        currentUserId: TEST_CUSTOMER_USER_ID,
        currentUserRole: 'CUSTOMER',
        ...overrides,
    });

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        orderReader = createMockOrderCommunicationReader();
        eventPublisher = createMockEventPublisher();
        useCase = new GetOrCreateOrderConversationUseCase(
            conversationRepository,
            orderReader,
            eventPublisher,
        );

        orderReader.findOrderForConversation.mockResolvedValue(buildOrderReadModel());
        conversationRepository.findByOrderId.mockResolvedValue(null);
        conversationRepository.save.mockResolvedValue(undefined);
        conversationRepository.saveParticipant.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('throws if order not found', async () => {
        orderReader.findOrderForConversation.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            OrderNotFoundForConversationError,
        );
    });

    it('throws if user is not related to the order', async () => {
        await expect(
            useCase.execute(command({ currentUserId: TEST_OTHER_USER_ID, currentUserRole: 'CUSTOMER' })),
        ).rejects.toBeInstanceOf(OrderConversationAccessDeniedError);
    });

    it('creates conversation when none exists', async () => {
        const result = await useCase.execute(command());
        expect(conversationRepository.save).toHaveBeenCalledTimes(1);
        expect(result.orderId.value).toBe(TEST_ORDER_ID);
    });

    it('publishes ConversationCreatedEvent when conversation is created', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(ConversationCreatedEvent)]),
        );
    });

    it('returns existing conversation without creating a new one', async () => {
        const existing = buildConversation();
        conversationRepository.findByOrderId.mockResolvedValue(existing);

        const result = await useCase.execute(command());
        expect(conversationRepository.save).not.toHaveBeenCalled();
        expect(result.id.value).toBe(existing.id.value);
    });

    it('courier can access order conversation', async () => {
        const result = await useCase.execute(
            command({ currentUserId: TEST_COURIER_USER_ID, currentUserRole: 'COURIER' }),
        );
        expect(result).toBeDefined();
    });

    it('adds participant if not already in existing conversation', async () => {
        const existing = buildConversation();
        conversationRepository.findByOrderId.mockResolvedValue(existing);

        await useCase.execute(command({ currentUserId: TEST_OTHER_USER_ID, currentUserRole: 'RESTAURANT_MANAGER' }));
        expect(conversationRepository.saveParticipant).toHaveBeenCalledTimes(1);
    });
});
