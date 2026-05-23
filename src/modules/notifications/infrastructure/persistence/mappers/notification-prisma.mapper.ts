import { Notification } from '../../../domain/entities/notification.entity';
import type { NotificationType } from '../../../domain/enums/notification-type.enum';
import { Prisma } from '@prisma/client';

type PrismaNotificationRow = {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    data: Prisma.JsonValue;
    readAt: Date | null;
    createdAt: Date;
};

export class NotificationPrismaMapper {
    static toDomain(raw: PrismaNotificationRow): Notification {
        return Notification.restore({
            id: raw.id,
            userId: raw.userId,
            type: raw.type as NotificationType,
            title: raw.title,
            body: raw.body,
            data: (raw.data as Record<string, unknown> | null) ?? null,
            readAt: raw.readAt ?? null,
            createdAt: raw.createdAt,
        });
    }

    static toPersistence(notification: Notification): {
        id: string;
        userId: string;
        type: string;
        title: string;
        body: string;
        data: Prisma.InputJsonValue | typeof Prisma.JsonNull;
        readAt: Date | null;
        createdAt: Date;
    } {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: notification.data !== null
                ? (notification.data as Prisma.InputJsonValue)
                : Prisma.JsonNull,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
        };
    }
}
