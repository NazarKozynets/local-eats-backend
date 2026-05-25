import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { MessageType } from '../enums/message-type.enum';
import { InvalidMessageBodyError } from '../errors/invalid-message-body.error';

export interface MessageProps {
    id: UUID;
    conversationId: UUID;
    senderUserId: UUID;
    type: MessageType;
    body: string;
    createdAt: Date;
    updatedAt: Date;
}

const MAX_BODY_LENGTH = 4000;

export class Message {
    private readonly props: MessageProps;

    private constructor(props: MessageProps) {
        this.props = props;
    }

    static create(p: {
        conversationId: UUID;
        senderUserId: UUID;
        type: MessageType;
        body: string;
    }): Message {
        Message.validateBody(p.body);
        const now = new Date();
        return new Message({
            id: UUID.generate(),
            conversationId: p.conversationId,
            senderUserId: p.senderUserId,
            type: p.type,
            body: p.body.trim(),
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: MessageProps): Message {
        return new Message(props);
    }

    private static validateBody(body: string): void {
        const trimmed = body.trim();
        if (!trimmed) {
            throw new InvalidMessageBodyError();
        }
        if (trimmed.length > MAX_BODY_LENGTH) {
            throw new InvalidMessageBodyError(`Message body cannot exceed ${MAX_BODY_LENGTH} characters`);
        }
    }

    get id(): UUID { return this.props.id; }
    get conversationId(): UUID { return this.props.conversationId; }
    get senderUserId(): UUID { return this.props.senderUserId; }
    get type(): MessageType { return this.props.type; }
    get body(): string { return this.props.body; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    belongsToSender(userId: string): boolean {
        return this.props.senderUserId.value === userId;
    }
}
