import { Inject, Injectable } from '@nestjs/common';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import {
    NOTIFICATION_REPOSITORY,
    type NotificationRepository,
} from '../../ports/notification.repository.port';
import { AllNotificationsReadEvent } from '../../../domain/events/all-notifications-read.event';
import type { MarkAllNotificationsAsReadCommand } from './mark-all-notifications-as-read.command';

export type MarkAllAsReadResult = { count: number };

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: MarkAllNotificationsAsReadCommand): Promise<MarkAllAsReadResult> {
        const readAt = new Date();
        const count = await this.notificationRepository.markAllAsRead(command.currentUserId, readAt);

        await this.eventPublisher.publishAll([
            new AllNotificationsReadEvent(command.currentUserId, readAt, count),
        ]);

        return { count };
    }
}
