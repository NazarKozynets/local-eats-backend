import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class NotificationCreatedEvent extends DomainEvent {
    constructor(
        public readonly notificationId: string,
        public readonly userId: string,
        public readonly type: string,
    ) {
        super();
    }
}
