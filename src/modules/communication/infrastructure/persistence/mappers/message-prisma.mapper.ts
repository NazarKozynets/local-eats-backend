import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Message } from '../../../domain/entities/message.entity';
import { MessageType } from '../../../domain/enums/message-type.enum';

type PrismaMessageRow = {
    id: string;
    conversationId: string;
    senderUserId: string;
    type: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
};

export class MessagePrismaMapper {
    static toDomain(raw: PrismaMessageRow): Message {
        return Message.restore({
            id: UUID.create(raw.id),
            conversationId: UUID.create(raw.conversationId),
            senderUserId: UUID.create(raw.senderUserId),
            type: raw.type as MessageType,
            body: raw.body,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(message: Message) {
        return {
            id: message.id.value,
            conversationId: message.conversationId.value,
            senderUserId: message.senderUserId.value,
            type: message.type,
            body: message.body,
        };
    }
}
