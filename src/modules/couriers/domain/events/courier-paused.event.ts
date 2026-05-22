import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierPausedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
