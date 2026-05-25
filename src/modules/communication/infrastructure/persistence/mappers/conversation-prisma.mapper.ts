import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { ConversationParticipant } from '../../../domain/entities/conversation-participant.entity';
import { ConversationType } from '../../../domain/enums/conversation-type.enum';
import { ConversationParticipantRole } from '../../../domain/enums/conversation-participant-role.enum';

type PrismaParticipantRow = {
    id: string;
    conversationId: string;
    userId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
};

type PrismaConversationRow = {
    id: string;
    orderId: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    participants: PrismaParticipantRow[];
};

export class ConversationPrismaMapper {
    static toDomain(raw: PrismaConversationRow): Conversation {
        const participants = raw.participants.map(p =>
            ConversationParticipant.restore({
                id: UUID.create(p.id),
                conversationId: UUID.create(p.conversationId),
                userId: UUID.create(p.userId),
                role: p.role as ConversationParticipantRole,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            }),
        );

        return Conversation.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            type: raw.type as ConversationType,
            participants,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(conversation: Conversation) {
        return {
            id: conversation.id.value,
            orderId: conversation.orderId.value,
            type: conversation.type,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }

    static participantToPersistence(participant: ConversationParticipant) {
        return {
            id: participant.id.value,
            conversationId: participant.conversationId.value,
            userId: participant.userId.value,
            role: participant.role,
        };
    }
}
