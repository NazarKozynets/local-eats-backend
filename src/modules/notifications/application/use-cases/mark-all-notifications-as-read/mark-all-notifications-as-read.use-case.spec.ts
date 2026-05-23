import { MarkAllNotificationsAsReadUseCase } from './mark-all-notifications-as-read.use-case';
import { MarkAllNotificationsAsReadCommand } from './mark-all-notifications-as-read.command';
import { AllNotificationsReadEvent } from '../../../domain/events/all-notifications-read.event';
import {
    createMockNotificationRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import { TEST_USER_ID } from '../../../__tests__/_helpers/builders';

describe('MarkAllNotificationsAsReadUseCase', () => {
    let repo: ReturnType<typeof createMockNotificationRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: MarkAllNotificationsAsReadUseCase;

    beforeEach(() => {
        repo = createMockNotificationRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new MarkAllNotificationsAsReadUseCase(repo, eventPublisher);

        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        MarkAllNotificationsAsReadCommand.create({ currentUserId: TEST_USER_ID });

    it('marks all unread notifications as read and returns the count', async () => {
        repo.markAllAsRead.mockResolvedValue(3);

        const result = await useCase.execute(command());

        expect(result).toEqual({ count: 3 });
        expect(repo.markAllAsRead).toHaveBeenCalledWith(TEST_USER_ID, expect.any(Date));
    });

    it('publishes AllNotificationsReadEvent with correct count', async () => {
        repo.markAllAsRead.mockResolvedValue(2);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(AllNotificationsReadEvent)]),
        );

        const [events] = eventPublisher.publishAll.mock.calls[0];
        const event = events.find((e: unknown) => e instanceof AllNotificationsReadEvent) as AllNotificationsReadEvent;
        expect(event.userId).toBe(TEST_USER_ID);
        expect(event.count).toBe(2);
    });

    it('returns count 0 when no unread notifications exist', async () => {
        repo.markAllAsRead.mockResolvedValue(0);

        const result = await useCase.execute(command());

        expect(result).toEqual({ count: 0 });
    });
});
