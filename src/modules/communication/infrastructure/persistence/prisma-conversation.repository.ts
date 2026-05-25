import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Conversation } from '../../domain/entities/conversation.entity';
import type { ConversationParticipant } from '../../domain/entities/conversation-participant.entity';
import type { ConversationRepository } from '../../application/ports/conversation.repository.port';
import { ConversationPrismaMapper } from './mappers/conversation-prisma.mapper';

const PARTICIPANTS_INCLUDE = {
    participants: {
        orderBy: { createdAt: 'asc' as const },
    },
};

@Injectable()
export class PrismaConversationRepository implements ConversationRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Conversation | null> {
        const row = await this.prisma.conversation.findUnique({
            where: { id: id.value },
            include: PARTICIPANTS_INCLUDE,
        });
        return row ? ConversationPrismaMapper.toDomain(row) : null;
    }

    async findByOrderId(orderId: string): Promise<Conversation | null> {
        const row = await this.prisma.conversation.findUnique({
            where: { orderId },
            include: PARTICIPANTS_INCLUDE,
        });
        return row ? ConversationPrismaMapper.toDomain(row) : null;
    }

    async findManyByUserId(userId: string): Promise<Conversation[]> {
        const rows = await this.prisma.conversation.findMany({
            where: { participants: { some: { userId } } },
            include: PARTICIPANTS_INCLUDE,
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map(ConversationPrismaMapper.toDomain);
    }

    async save(conversation: Conversation): Promise<void> {
        const data = ConversationPrismaMapper.toPersistence(conversation);
        const participants = conversation.participants.map(
            ConversationPrismaMapper.participantToPersistence,
        );

        await this.prisma.conversation.create({
            data: {
                id: data.id,
                orderId: data.orderId,
                type: data.type as never,
                participants: {
                    create: participants.map(p => ({
                        id: p.id,
                        userId: p.userId,
                        role: p.role as never,
                    })),
                },
            },
        });
    }

    async saveParticipant(participant: ConversationParticipant): Promise<void> {
        const data = ConversationPrismaMapper.participantToPersistence(participant);
        await this.prisma.conversationParticipant.create({
            data: {
                id: data.id,
                conversationId: data.conversationId,
                userId: data.userId,
                role: data.role as never,
            },
        });
    }
}
