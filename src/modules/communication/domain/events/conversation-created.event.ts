import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class ConversationCreatedEvent extends DomainEvent {
    constructor(
        public readonly conversationId: string,
        public readonly orderId: string,
    ) {
        super();
    }
}
