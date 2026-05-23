import { GetMyNotificationsUseCase } from './get-my-notifications.use-case';
import { GetMyNotificationsCommand } from './get-my-notifications.command';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { createMockNotificationRepository } from '../../../__tests__/_helpers/mocks';
import {
    buildNotification,
    TEST_USER_ID,
    TEST_OTHER_USER_ID,
} from '../../../__tests__/_helpers/builders';

describe('GetMyNotificationsUseCase', () => {
    let repo: ReturnType<typeof createMockNotificationRepository>;
    let useCase: GetMyNotificationsUseCase;

    beforeEach(() => {
        repo = createMockNotificationRepository();
        useCase = new GetMyNotificationsUseCase(repo);
    });

    it('returns current user notifications', async () => {
        const notifications = [
            buildNotification({ userId: TEST_USER_ID }),
            buildNotification({ id: 'bb0e8400-e29b-41d4-a716-446655440022', userId: TEST_USER_ID }),
        ];
        repo.findManyByUserId.mockResolvedValue(notifications);

        const result = await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_USER_ID }),
        );

        expect(result).toEqual(notifications);
        expect(repo.findManyByUserId).toHaveBeenCalledWith(TEST_USER_ID, {
            unreadOnly: undefined,
            page: undefined,
            limit: undefined,
        });
    });

    it('supports unreadOnly filter', async () => {
        const unread = buildNotification({ userId: TEST_USER_ID, readAt: null });
        repo.findManyByUserId.mockResolvedValue([unread]);

        const result = await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_USER_ID, unreadOnly: true }),
        );

        expect(result).toHaveLength(1);
        expect(repo.findManyByUserId).toHaveBeenCalledWith(TEST_USER_ID, {
            unreadOnly: true,
            page: undefined,
            limit: undefined,
        });
    });

    it('passes pagination parameters to repository', async () => {
        repo.findManyByUserId.mockResolvedValue([]);

        await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_USER_ID, page: 2, limit: 10 }),
        );

        expect(repo.findManyByUserId).toHaveBeenCalledWith(TEST_USER_ID, {
            unreadOnly: undefined,
            page: 2,
            limit: 10,
        });
    });

    it('does NOT return other users notifications', async () => {
        const currentUserNotifications = [buildNotification({ userId: TEST_USER_ID })];
        repo.findManyByUserId.mockImplementation(async (userId) => {
            if (userId === TEST_USER_ID) return currentUserNotifications;
            return [];
        });

        const resultForCurrent = await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_USER_ID }),
        );
        const resultForOther = await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_OTHER_USER_ID }),
        );

        expect(resultForCurrent).toHaveLength(1);
        expect(resultForOther).toHaveLength(0);
    });

    it('returns notifications of specific type', async () => {
        const orderNotification = buildNotification({
            userId: TEST_USER_ID,
            type: NotificationType.ORDER_CREATED,
        });
        repo.findManyByUserId.mockResolvedValue([orderNotification]);

        const result = await useCase.execute(
            GetMyNotificationsCommand.create({ currentUserId: TEST_USER_ID }),
        );

        expect(result[0].type).toBe(NotificationType.ORDER_CREATED);
    });
});
