import { GetMyConversationsUseCase } from './get-my-conversations.use-case';
import { buildConversation, TEST_CUSTOMER_USER_ID } from '../../../__tests__/_helpers/builders';
import { createMockConversationRepository } from '../../../__tests__/_helpers/mocks';

describe('GetMyConversationsUseCase', () => {
    let conversationRepository: ReturnType<typeof createMockConversationRepository>;
    let useCase: GetMyConversationsUseCase;

    beforeEach(() => {
        conversationRepository = createMockConversationRepository();
        useCase = new GetMyConversationsUseCase(conversationRepository);
        conversationRepository.findManyByUserId.mockResolvedValue([buildConversation()]);
    });

    it('returns conversations for the user', async () => {
        const result = await useCase.execute({ currentUserId: TEST_CUSTOMER_USER_ID });
        expect(result).toHaveLength(1);
        expect(conversationRepository.findManyByUserId).toHaveBeenCalledWith(TEST_CUSTOMER_USER_ID);
    });

    it('returns empty list when no conversations exist', async () => {
        conversationRepository.findManyByUserId.mockResolvedValue([]);
        const result = await useCase.execute({ currentUserId: TEST_CUSTOMER_USER_ID });
        expect(result).toHaveLength(0);
    });
});
