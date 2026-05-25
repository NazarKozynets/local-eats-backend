import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class MessageSentEvent extends DomainEvent {
    constructor(
        public readonly messageId: string,
        public readonly conversationId: string,
        public readonly senderUserId: string,
    ) {
        super();
    }
}
