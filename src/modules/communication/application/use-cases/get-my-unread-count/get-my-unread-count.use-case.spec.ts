import { GetMyUnreadCountUseCase } from './get-my-unread-count.use-case';
import { TEST_CUSTOMER_USER_ID } from '../../../__tests__/_helpers/builders';
import { createMockMessageRepository } from '../../../__tests__/_helpers/mocks';

describe('GetMyUnreadCountUseCase', () => {
    let messageRepository: ReturnType<typeof createMockMessageRepository>;
    let useCase: GetMyUnreadCountUseCase;

    beforeEach(() => {
        messageRepository = createMockMessageRepository();
        useCase = new GetMyUnreadCountUseCase(messageRepository);
        messageRepository.countUnreadByParticipantId.mockResolvedValue(5);
    });

    it('returns unread count for the user', async () => {
        const result = await useCase.execute({ currentUserId: TEST_CUSTOMER_USER_ID });
        expect(result).toBe(5);
        expect(messageRepository.countUnreadByParticipantId).toHaveBeenCalledWith(
            TEST_CUSTOMER_USER_ID,
        );
    });

    it('returns zero when no unread messages', async () => {
        messageRepository.countUnreadByParticipantId.mockResolvedValue(0);
        const result = await useCase.execute({ currentUserId: TEST_CUSTOMER_USER_ID });
        expect(result).toBe(0);
    });
});
