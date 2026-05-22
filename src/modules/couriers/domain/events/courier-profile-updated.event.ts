import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierProfileUpdatedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
