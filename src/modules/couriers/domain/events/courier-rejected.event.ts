import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierRejectedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
        public readonly actorUserId: string,
        public readonly reason: string,
    ) {
        super();
    }
}
