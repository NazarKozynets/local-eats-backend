import { CreateNotificationUseCase } from './create-notification.use-case';
import { CreateNotificationCommand } from './create-notification.command';
import { NotificationType } from '../../../domain/enums/notification-type.enum';
import { InvalidNotificationTitleError } from '../../../domain/errors/invalid-notification-title.error';
import { InvalidNotificationBodyError } from '../../../domain/errors/invalid-notification-body.error';
import { NotificationCreatedEvent } from '../../../domain/events/notification-created.event';
import {
    createMockNotificationRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import { TEST_USER_ID } from '../../../__tests__/_helpers/builders';

describe('CreateNotificationUseCase', () => {
    let repo: ReturnType<typeof createMockNotificationRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateNotificationUseCase;

    beforeEach(() => {
        repo = createMockNotificationRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateNotificationUseCase(repo, eventPublisher);

        repo.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const validCommand = (overrides: Partial<{
        title: string;
        body: string;
        type: NotificationType;
    }> = {}) =>
        CreateNotificationCommand.create({
            userId: TEST_USER_ID,
            type: overrides.type ?? NotificationType.SYSTEM,
            title: overrides.title ?? 'Hello',
            body: overrides.body ?? 'This is a notification.',
        });

    it('creates notification with valid data, saves and publishes NotificationCreatedEvent', async () => {
        await useCase.execute(validCommand());

        expect(repo.save).toHaveBeenCalledTimes(1);
        const [saved] = repo.save.mock.calls[0];
        expect(saved.userId).toBe(TEST_USER_ID);
        expect(saved.type).toBe(NotificationType.SYSTEM);
        expect(saved.title).toBe('Hello');
        expect(saved.body).toBe('This is a notification.');
        expect(saved.readAt).toBeNull();

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(NotificationCreatedEvent)]),
        );
    });

    it('fails if title is empty → throws InvalidNotificationTitleError', async () => {
        await expect(useCase.execute(validCommand({ title: '' }))).rejects.toBeInstanceOf(
            InvalidNotificationTitleError,
        );
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('fails if title is whitespace-only → throws InvalidNotificationTitleError', async () => {
        await expect(useCase.execute(validCommand({ title: '   ' }))).rejects.toBeInstanceOf(
            InvalidNotificationTitleError,
        );
    });

    it('fails if body is empty → throws InvalidNotificationBodyError', async () => {
        await expect(useCase.execute(validCommand({ body: '' }))).rejects.toBeInstanceOf(
            InvalidNotificationBodyError,
        );
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('fails if body is whitespace-only → throws InvalidNotificationBodyError', async () => {
        await expect(useCase.execute(validCommand({ body: '   ' }))).rejects.toBeInstanceOf(
            InvalidNotificationBodyError,
        );
    });

    it('stores optional data when provided', async () => {
        const data = { orderId: 'some-order-id' };
        await useCase.execute(
            CreateNotificationCommand.create({
                userId: TEST_USER_ID,
                type: NotificationType.ORDER_CREATED,
                title: 'Order placed',
                body: 'Your order has been placed.',
                data,
            }),
        );

        const [saved] = repo.save.mock.calls[0];
        expect(saved.data).toEqual(data);
    });
});
