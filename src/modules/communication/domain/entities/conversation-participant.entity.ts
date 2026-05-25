import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { ConversationParticipantRole } from '../enums/conversation-participant-role.enum';

export interface ConversationParticipantProps {
    id: UUID;
    conversationId: UUID;
    userId: UUID;
    role: ConversationParticipantRole;
    createdAt: Date;
    updatedAt: Date;
}

export class ConversationParticipant {
    private readonly props: ConversationParticipantProps;

    private constructor(props: ConversationParticipantProps) {
        this.props = props;
    }

    static create(p: {
        conversationId: UUID;
        userId: UUID;
        role: ConversationParticipantRole;
    }): ConversationParticipant {
        const now = new Date();
        return new ConversationParticipant({
            id: UUID.generate(),
            conversationId: p.conversationId,
            userId: p.userId,
            role: p.role,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: ConversationParticipantProps): ConversationParticipant {
        return new ConversationParticipant(props);
    }

    get id(): UUID { return this.props.id; }
    get conversationId(): UUID { return this.props.conversationId; }
    get userId(): UUID { return this.props.userId; }
    get role(): ConversationParticipantRole { return this.props.role; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
