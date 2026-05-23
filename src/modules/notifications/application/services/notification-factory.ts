import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Notification } from '../../domain/entities/notification.entity';
import type { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class NotificationFactory {
    createFromEvent(
        eventType: NotificationType,
        recipientUserId: string,
        title: string,
        body: string,
        data?: Record<string, unknown> | null,
    ): Notification {
        return Notification.create({
            id: randomUUID(),
            userId: recipientUserId,
            type: eventType,
            title,
            body,
            data: data ?? null,
        });
    }
}
