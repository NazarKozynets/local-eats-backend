import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierLocationUpdatedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
        public readonly latitude: number,
        public readonly longitude: number,
    ) {
        super();
    }
}
