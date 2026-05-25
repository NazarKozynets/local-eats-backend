import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class MessagesMarkedAsReadEvent extends DomainEvent {
    constructor(
        public readonly conversationId: string,
        public readonly participantId: string,
        public readonly markedCount: number,
    ) {
        super();
    }
}
