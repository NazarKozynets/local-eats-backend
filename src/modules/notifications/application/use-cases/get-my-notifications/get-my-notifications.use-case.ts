import { Inject, Injectable } from '@nestjs/common';
import type { Notification } from '../../../domain/entities/notification.entity';
import {
    NOTIFICATION_REPOSITORY,
    type NotificationRepository,
} from '../../ports/notification.repository.port';
import type { GetMyNotificationsCommand } from './get-my-notifications.command';

@Injectable()
export class GetMyNotificationsUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
    ) {}

    async execute(command: GetMyNotificationsCommand): Promise<Notification[]> {
        return this.notificationRepository.findManyByUserId(command.currentUserId, {
            unreadOnly: command.unreadOnly,
            page: command.page,
            limit: command.limit,
        });
    }
}
