import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { ConversationType } from '../enums/conversation-type.enum';
import { ConversationParticipantRole } from '../enums/conversation-participant-role.enum';
import { ConversationParticipant } from './conversation-participant.entity';

export interface ConversationProps {
    id: UUID;
    orderId: UUID;
    type: ConversationType;
    participants: ConversationParticipant[];
    createdAt: Date;
    updatedAt: Date;
}

export class Conversation {
    private readonly props: ConversationProps;

    private constructor(props: ConversationProps) {
        this.props = props;
    }

    static create(p: { orderId: UUID; type: ConversationType }): Conversation {
        const now = new Date();
        return new Conversation({
            id: UUID.generate(),
            orderId: p.orderId,
            type: p.type,
            participants: [],
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: ConversationProps): Conversation {
        return new Conversation(props);
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get type(): ConversationType { return this.props.type; }
    get participants(): ConversationParticipant[] { return [...this.props.participants]; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    addParticipant(userId: UUID, role: ConversationParticipantRole): ConversationParticipant {
        const existing = this.props.participants.find(p => p.userId.value === userId.value);
        if (existing) return existing;

        const participant = ConversationParticipant.create({
            conversationId: this.props.id,
            userId,
            role,
        });
        this.props.participants.push(participant);
        return participant;
    }

    isParticipant(userId: string): boolean {
        return this.props.participants.some(p => p.userId.value === userId);
    }

    findParticipant(userId: string): ConversationParticipant | null {
        return this.props.participants.find(p => p.userId.value === userId) ?? null;
    }
}
