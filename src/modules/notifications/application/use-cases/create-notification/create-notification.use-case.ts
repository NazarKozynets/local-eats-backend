import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { Notification } from '../../../domain/entities/notification.entity';
import {
    NOTIFICATION_REPOSITORY,
    type NotificationRepository,
} from '../../ports/notification.repository.port';
import type { CreateNotificationCommand } from './create-notification.command';

@Injectable()
export class CreateNotificationUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateNotificationCommand): Promise<void> {
        const notification = Notification.create({
            id: randomUUID(),
            userId: command.userId,
            type: command.type,
            title: command.title,
            body: command.body,
            data: command.data ?? null,
        });

        await this.notificationRepository.save(notification);

        const events = notification.pullDomainEvents();
        await this.eventPublisher.publishAll(events);
    }
}
