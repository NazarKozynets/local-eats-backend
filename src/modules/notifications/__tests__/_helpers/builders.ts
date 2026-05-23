import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import type { NotificationProps } from '../../domain/entities/notification.entity';

export const TEST_NOTIFICATION_ID = 'aa0e8400-e29b-41d4-a716-446655440011';
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildNotificationOverrides = Partial<NotificationProps>;

export function buildNotification(overrides: BuildNotificationOverrides = {}): Notification {
    return Notification.restore({
        id: overrides.id ?? TEST_NOTIFICATION_ID,
        userId: overrides.userId ?? TEST_USER_ID,
        type: overrides.type ?? NotificationType.SYSTEM,
        title: overrides.title ?? 'Test notification',
        body: overrides.body ?? 'This is a test notification body.',
        data: overrides.data !== undefined ? overrides.data : null,
        readAt: overrides.readAt !== undefined ? overrides.readAt : null,
        createdAt: overrides.createdAt ?? FIXED_DATE,
    });
}
