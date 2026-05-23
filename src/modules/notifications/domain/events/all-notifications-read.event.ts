import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AllNotificationsReadEvent extends DomainEvent {
    constructor(
        public readonly userId: string,
        public readonly readAt: Date,
        public readonly count: number,
    ) {
        super();
    }
}
