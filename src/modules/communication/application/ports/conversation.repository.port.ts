import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { Conversation } from '../../domain/entities/conversation.entity';
import type { ConversationParticipant } from '../../domain/entities/conversation-participant.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface ConversationRepository {
    findById(id: UUID): Promise<Conversation | null>;
    findByOrderId(orderId: string): Promise<Conversation | null>;
    findManyByUserId(userId: string): Promise<Conversation[]>;
    save(conversation: Conversation): Promise<void>;
    saveParticipant(participant: ConversationParticipant): Promise<void>;
}
