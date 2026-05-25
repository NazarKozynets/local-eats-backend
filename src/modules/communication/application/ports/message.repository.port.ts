import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { Message } from '../../domain/entities/message.entity';

export type MessagePagination = { page?: number; limit?: number };

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface MessageRepository {
    findById(id: UUID): Promise<Message | null>;
    findManyByConversationId(conversationId: string, pagination: MessagePagination): Promise<Message[]>;
    save(message: Message): Promise<void>;
    markMessagesAsRead(conversationId: string, participantId: string): Promise<number>;
    countUnreadByParticipantId(participantId: string): Promise<number>;
}
