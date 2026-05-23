import type { Notification } from '../../domain/entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type NotificationFilters = {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
};

export interface NotificationRepository {
    findById(id: string): Promise<Notification | null>;
    findManyByUserId(userId: string, filters: NotificationFilters): Promise<Notification[]>;
    countUnreadByUserId(userId: string): Promise<number>;
    save(notification: Notification): Promise<void>;
    update(notification: Notification): Promise<void>;
    markAllAsRead(userId: string, readAt: Date): Promise<number>;
}
