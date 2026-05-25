import { SendMessageUseCase } from './send-message.use-case';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import { InvalidMessageBodyError } from '../../../domain/errors/invalid-message-body.error';
import { MessageSentEvent } from '../../../domain/events/message-sent.event';
import {
    buildConversation,
    TEST_CUSTOMER_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_CONVERSATION_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockConversationRepository,
    createMockMessageRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('SendMessageUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let messageRepository: ReturnType<typeof createMockMessageRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: SendMessageUseCase;

    const command = (overrides = {}) => ({
        conversationId: TEST_CONVERSATION_ID,
        senderUserId: TEST_CUSTOMER_USER_ID,
        body: 'Hello there',
        ...overrides,
    });

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        messageRepository = createMockMessageRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new SendMessageUseCase(conversationRepository, messageRepository, eventPublisher);

        conversationRepository.findById.mockResolvedValue(buildConversation());
        messageRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('sends a message successfully', async () => {
        const result = await useCase.execute(command());
        expect(result.body).toBe('Hello there');
        expect(messageRepository.save).toHaveBeenCalledTimes(1);
    });

    it('throws if conversation not found', async () => {
        conversationRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ConversationNotFoundError);
    });

    it('throws if sender is not a participant', async () => {
        await expect(
            useCase.execute(command({ senderUserId: TEST_OTHER_USER_ID })),
        ).rejects.toBeInstanceOf(NotAConversationParticipantError);
    });

    it('throws if message body is empty', async () => {
        await expect(useCase.execute(command({ body: '   ' }))).rejects.toBeInstanceOf(
            InvalidMessageBodyError,
        );
    });

    it('throws if message body exceeds max length', async () => {
        await expect(
            useCase.execute(command({ body: 'x'.repeat(4001) })),
        ).rejects.toBeInstanceOf(InvalidMessageBodyError);
    });

    it('publishes MessageSentEvent', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MessageSentEvent)]),
        );
    });
});
