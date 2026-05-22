import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierProfileCreatedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
