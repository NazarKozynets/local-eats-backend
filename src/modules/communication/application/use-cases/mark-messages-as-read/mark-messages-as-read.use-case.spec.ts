import { MarkMessagesAsReadUseCase } from './mark-messages-as-read.use-case';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import { MessagesMarkedAsReadEvent } from '../../../domain/events/messages-marked-as-read.event';
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

describe('MarkMessagesAsReadUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let messageRepository: ReturnType<typeof createMockMessageRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkMessagesAsReadUseCase;

    const command = (overrides = {}) => ({
        conversationId: TEST_CONVERSATION_ID,
        currentUserId: TEST_CUSTOMER_USER_ID,
        ...overrides,
    });

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        messageRepository = createMockMessageRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkMessagesAsReadUseCase(conversationRepository, messageRepository, eventPublisher);

        conversationRepository.findById.mockResolvedValue(buildConversation());
        messageRepository.markMessagesAsRead.mockResolvedValue(3);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('marks messages as read successfully', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(messageRepository.markMessagesAsRead).toHaveBeenCalledTimes(1);
    });

    it('throws if conversation not found', async () => {
        conversationRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(ConversationNotFoundError);
    });

    it('throws if user is not a participant', async () => {
        await expect(
            useCase.execute(command({ currentUserId: TEST_OTHER_USER_ID })),
        ).rejects.toBeInstanceOf(NotAConversationParticipantError);
    });

    it('publishes MessagesMarkedAsReadEvent when messages were marked', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MessagesMarkedAsReadEvent)]),
        );
    });

    it('does not publish event when no messages were unread', async () => {
        messageRepository.markMessagesAsRead.mockResolvedValue(0);
        await useCase.execute(command());
        expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });
});
