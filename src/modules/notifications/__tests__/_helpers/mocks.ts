import type { NotificationRepository } from '../../application/ports/notification.repository.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockNotificationRepository(): jest.Mocked<NotificationRepository> {
    return {
        findById: jest.fn(),
        findManyByUserId: jest.fn(),
        countUnreadByUserId: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        markAllAsRead: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
