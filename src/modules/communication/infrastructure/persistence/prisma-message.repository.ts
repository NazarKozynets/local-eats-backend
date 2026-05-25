import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Message } from '../../domain/entities/message.entity';
import type { MessageRepository, MessagePagination } from '../../application/ports/message.repository.port';
import { MessagePrismaMapper } from './mappers/message-prisma.mapper';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Message | null> {
        const row = await this.prisma.message.findUnique({ where: { id: id.value } });
        return row ? MessagePrismaMapper.toDomain(row) : null;
    }

    async findManyByConversationId(conversationId: string, pagination: MessagePagination): Promise<Message[]> {
        const { skip, take } = this.resolvePagination(pagination);
        const rows = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            skip,
            take,
        });
        return rows.map(MessagePrismaMapper.toDomain);
    }

    async save(message: Message): Promise<void> {
        const data = MessagePrismaMapper.toPersistence(message);
        await this.prisma.message.create({
            data: {
                id: data.id,
                conversationId: data.conversationId,
                senderUserId: data.senderUserId,
                type: data.type as never,
                body: data.body,
            },
        });
    }

    async markMessagesAsRead(conversationId: string, participantId: string): Promise<number> {
        const unread = await this.prisma.message.findMany({
            where: {
                conversationId,
                readReceipts: { none: { participantId } },
            },
            select: { id: true },
        });

        if (unread.length === 0) return 0;

        await this.prisma.messageReadReceipt.createMany({
            data: unread.map(m => ({
                messageId: m.id,
                participantId,
            })),
            skipDuplicates: true,
        });

        return unread.length;
    }

    async countUnreadByParticipantId(userId: string): Promise<number> {
        return this.prisma.message.count({
            where: {
                conversation: { participants: { some: { userId } } },
                readReceipts: {
                    none: {
                        participant: { userId },
                    },
                },
            },
        });
    }

    private resolvePagination(pagination: MessagePagination): { skip: number; take: number } {
        const page = Math.max(1, pagination.page ?? DEFAULT_PAGE);
        const take = Math.min(MAX_LIMIT, Math.max(1, pagination.limit ?? DEFAULT_LIMIT));
        return { skip: (page - 1) * take, take };
    }
}
