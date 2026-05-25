import { GetConversationUseCase } from './get-conversation.use-case';
import { ConversationNotFoundError } from '../../../domain/errors/conversation-not-found.error';
import { NotAConversationParticipantError } from '../../../domain/errors/not-a-conversation-participant.error';
import {
    buildConversation,
    TEST_CUSTOMER_USER_ID,
    TEST_OTHER_USER_ID,
    TEST_CONVERSATION_ID,
} from '../../../__tests__/_helpers/builders';
import { createMockConversationRepository } from '../../../__tests__/_helpers/mocks';

describe('GetConversationUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let useCase: GetConversationUseCase;

    const command = (overrides = {}) => ({
        conversationId: TEST_CONVERSATION_ID,
        currentUserId: TEST_CUSTOMER_USER_ID,
        ...overrides,
    });

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        useCase = new GetConversationUseCase(conversationRepository);
        conversationRepository.findById.mockResolvedValue(buildConversation());
    });

    it('returns conversation for a participant', async () => {
        const result = await useCase.execute(command());
        expect(result.id.value).toBe(TEST_CONVERSATION_ID);
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
});
