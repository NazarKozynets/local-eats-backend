import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierActivatedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
