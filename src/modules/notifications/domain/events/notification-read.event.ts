import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class NotificationReadEvent extends DomainEvent {
    constructor(
        public readonly notificationId: string,
        public readonly userId: string,
        public readonly readAt: Date,
    ) {
        super();
    }
}
