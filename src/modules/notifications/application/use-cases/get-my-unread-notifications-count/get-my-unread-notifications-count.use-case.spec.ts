import { GetMyUnreadNotificationsCountUseCase } from './get-my-unread-notifications-count.use-case';
import { GetMyUnreadNotificationsCountCommand } from './get-my-unread-notifications-count.command';
import { createMockNotificationRepository } from '../../../__tests__/_helpers/mocks';
import { TEST_USER_ID, TEST_OTHER_USER_ID } from '../../../__tests__/_helpers/builders';

describe('GetMyUnreadNotificationsCountUseCase', () => {
    let repo: ReturnType<typeof createMockNotificationRepository>;
    let useCase: GetMyUnreadNotificationsCountUseCase;

    beforeEach(() => {
        repo = createMockNotificationRepository();
        useCase = new GetMyUnreadNotificationsCountUseCase(repo);
    });

    it('returns correct unread count for the current user', async () => {
        repo.countUnreadByUserId.mockResolvedValue(5);

        const result = await useCase.execute(
            GetMyUnreadNotificationsCountCommand.create({ currentUserId: TEST_USER_ID }),
        );

        expect(result).toEqual({ count: 5 });
        expect(repo.countUnreadByUserId).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('returns 0 when there are no unread notifications', async () => {
        repo.countUnreadByUserId.mockResolvedValue(0);

        const result = await useCase.execute(
            GetMyUnreadNotificationsCountCommand.create({ currentUserId: TEST_USER_ID }),
        );

        expect(result).toEqual({ count: 0 });
    });

    it('queries by the passed userId, not another user', async () => {
        repo.countUnreadByUserId.mockImplementation(async (userId) => {
            if (userId === TEST_USER_ID) return 3;
            return 0;
        });

        const resultCurrent = await useCase.execute(
            GetMyUnreadNotificationsCountCommand.create({ currentUserId: TEST_USER_ID }),
        );
        const resultOther = await useCase.execute(
            GetMyUnreadNotificationsCountCommand.create({ currentUserId: TEST_OTHER_USER_ID }),
        );

        expect(resultCurrent).toEqual({ count: 3 });
        expect(resultOther).toEqual({ count: 0 });
    });
});
