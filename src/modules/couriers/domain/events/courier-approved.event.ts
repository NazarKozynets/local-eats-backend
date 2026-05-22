import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierApprovedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
