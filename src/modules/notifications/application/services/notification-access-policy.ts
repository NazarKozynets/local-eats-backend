import { Injectable } from '@nestjs/common';
import type { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class NotificationAccessPolicy {
    canRead(currentUserId: string, notification: Notification): boolean {
        return notification.belongsTo(currentUserId);
    }
}
