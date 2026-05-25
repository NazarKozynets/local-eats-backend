import { GetConversationMessagesUseCase } from './get-conversation-messages.use-case';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import {
    buildConversation,
    buildMessage,
    TEST_CUSTOMER_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_CONVERSATION_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockConversationRepository,
    createMockMessageRepository,
} from '../../../__tests__/_helpers/mocks';

describe('GetConversationMessagesUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let messageRepository: ReturnType<typeof createMockMessageRepository>;
    let useCase: GetConversationMessagesUseCase;

    const command = (overrides = {}) => ({
        conversationId: TEST_CONVERSATION_ID,
        currentUserId: TEST_CUSTOMER_USER_ID,
        ...overrides,
    });

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        messageRepository = createMockMessageRepository();
        useCase = new GetConversationMessagesUseCase(conversationRepository, messageRepository);

        conversationRepository.findById.mockResolvedValue(buildConversation());
        messageRepository.findManyByConversationId.mockResolvedValue([buildMessage()]);
    });

    it('returns messages for a participant', async () => {
        const result = await useCase.execute(command());
        expect(result).toHaveLength(1);
        expect(messageRepository.findManyByConversationId).toHaveBeenCalledWith(
            TEST_CONVERSATION_ID,
            expect.objectContaining({}),
        );
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

    it('passes pagination to repository', async () => {
        await useCase.execute(command({ page: 2, limit: 10 }));
        expect(messageRepository.findManyByConversationId).toHaveBeenCalledWith(
            TEST_CONVERSATION_ID,
            { page: 2, limit: 10 },
        );
    });
});
