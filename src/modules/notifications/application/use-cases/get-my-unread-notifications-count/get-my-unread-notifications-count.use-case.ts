import { Inject, Injectable } from '@nestjs/common';
import {
    NOTIFICATION_REPOSITORY,
    type NotificationRepository,
} from '../../ports/notification.repository.port';
import type { GetMyUnreadNotificationsCountCommand } from './get-my-unread-notifications-count.command';

export type UnreadCountResult = { count: number };

@Injectable()
export class GetMyUnreadNotificationsCountUseCase {
    constructor(
        @Inject(NOTIFICATION_REPOSITORY)
        private readonly notificationRepository: NotificationRepository,
    ) {}

    async execute(command: GetMyUnreadNotificationsCountCommand): Promise<UnreadCountResult> {
        const count = await this.notificationRepository.countUnreadByUserId(command.currentUserId);
        return { count };
    }
}
