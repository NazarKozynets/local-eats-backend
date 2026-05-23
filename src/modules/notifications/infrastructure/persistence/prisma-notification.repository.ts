import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Notification } from '../../domain/entities/notification.entity';
import type { NotificationRepository, NotificationFilters } from '../../application/ports/notification.repository.port';
import { NotificationPrismaMapper } from './mappers/notification-prisma.mapper';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<Notification | null> {
        const row = await this.prisma.notification.findUnique({ where: { id } });
        return row ? NotificationPrismaMapper.toDomain(row) : null;
    }

    async findManyByUserId(userId: string, filters: NotificationFilters): Promise<Notification[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.notification.findMany({
            where: {
                userId,
                ...(filters.unreadOnly ? { readAt: null } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        return rows.map(NotificationPrismaMapper.toDomain);
    }

    async countUnreadByUserId(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: { userId, readAt: null },
        });
    }

    async save(notification: Notification): Promise<void> {
        const mapped = NotificationPrismaMapper.toPersistence(notification);
        await this.prisma.notification.create({
            data: {
                id: mapped.id,
                userId: mapped.userId,
                type: mapped.type as never,
                title: mapped.title,
                body: mapped.body,
                data: mapped.data,
                readAt: mapped.readAt,
                createdAt: mapped.createdAt,
            },
        });
    }

    async update(notification: Notification): Promise<void> {
        await this.prisma.notification.update({
            where: { id: notification.id },
            data: { readAt: notification.readAt },
        });
    }

    async markAllAsRead(userId: string, readAt: Date): Promise<number> {
        const result = await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt },
        });
        return result.count;
    }
}
