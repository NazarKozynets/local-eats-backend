import { Inject, Injectable } from '@nestjs/common';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import {
    NOTIFICATION_REPOSITORY,
    type NotificationRepository,
} from '../../ports/notification.repository.port';
import { NotificationNotFoundError } from '../../../domain/errors/notification-not-found.error';
import { NotificationAccessDeniedError } from '../../../domain/errors/notification-access-denied.error';
import { NotificationReadEvent } from '../../../domain/events/notification-read.event';
import type { MarkNotificationAsReadCommand } from './mark-notification-as-read.command';

@Injectable()
export class MarkNotificationAsReadUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: MarkNotificationAsReadCommand): Promise<void> {
        const notification = await this.notificationRepository.findById(command.notificationId);

        if (!notification) {
            throw new NotificationNotFoundError();
        }

        if (!notification.belongsTo(command.currentUserId)) {
            throw new NotificationAccessDeniedError();
        }

        const readAt = new Date();
        notification.markAsRead(readAt);

        await this.notificationRepository.update(notification);

        await this.eventPublisher.publishAll([
            new NotificationReadEvent(notification.id, notification.userId, readAt),
        ]);
    }
}
