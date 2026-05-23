import { MarkNotificationAsReadUseCase } from './mark-notification-as-read.use-case';
import { MarkNotificationAsReadCommand } from './mark-notification-as-read.command';
import { NotificationNotFoundError } from '../../../domain/errors/notification-not-found.error';
import { NotificationAccessDeniedError } from '../../../domain/errors/notification-access-denied.error';
import { NotificationReadEvent } from '../../../domain/events/notification-read.event';
import {
    createMockNotificationRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import {
    buildNotification,
    TEST_NOTIFICATION_ID,
    TEST_USER_ID,
    TEST_OTHER_USER_ID,
} from '../../../__tests__/_helpers/builders';

describe('MarkNotificationAsReadUseCase', () => {
    let repo: ReturnType<typeof createMockNotificationRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkNotificationAsReadUseCase;

    beforeEach(() => {
        repo = createMockNotificationRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkNotificationAsReadUseCase(repo, eventPublisher);

        repo.update.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides: Partial<{ currentUserId: string; notificationId: string }> = {}) =>
        MarkNotificationAsReadCommand.create({
            currentUserId: overrides.currentUserId ?? TEST_USER_ID,
            notificationId: overrides.notificationId ?? TEST_NOTIFICATION_ID,
        });

    it('marks own notification as read, sets readAt, publishes NotificationReadEvent', async () => {
        const notification = buildNotification({ userId: TEST_USER_ID, readAt: null });
        repo.findById.mockResolvedValue(notification);

        await useCase.execute(command());

        expect(repo.update).toHaveBeenCalledTimes(1);
        const [updated] = repo.update.mock.calls[0];
        expect(updated.isRead()).toBe(true);
        expect(updated.readAt).toBeInstanceOf(Date);

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(NotificationReadEvent)]),
        );
    });

    it('fails if notification not found → NotificationNotFoundError', async () => {
        repo.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(NotificationNotFoundError);
        expect(repo.update).not.toHaveBeenCalled();
    });

    it('fails if notification belongs to another user → NotificationAccessDeniedError', async () => {
        const notification = buildNotification({ userId: TEST_OTHER_USER_ID });
        repo.findById.mockResolvedValue(notification);

        await expect(useCase.execute(command({ currentUserId: TEST_USER_ID }))).rejects.toBeInstanceOf(
            NotificationAccessDeniedError,
        );
        expect(repo.update).not.toHaveBeenCalled();
    });

    it('is idempotent if already read — still calls update and publishes event', async () => {
        const alreadyRead = buildNotification({
            userId: TEST_USER_ID,
            readAt: new Date('2026-01-01T00:00:00Z'),
        });
        repo.findById.mockResolvedValue(alreadyRead);

        await useCase.execute(command());

        expect(repo.update).toHaveBeenCalledTimes(1);
        const [updated] = repo.update.mock.calls[0];
        expect(updated.readAt).toEqual(new Date('2026-01-01T00:00:00Z'));
    });
});
