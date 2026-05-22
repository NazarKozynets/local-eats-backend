import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierBlockedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
