import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { CourierAvailabilityStatus } from '../enums/courier-availability-status.enum';

export class CourierAvailabilityChangedEvent extends DomainEvent {
    constructor(
        public readonly courierProfileId: string,
        public readonly userId: string,
        public readonly previousStatus: CourierAvailabilityStatus,
        public readonly newStatus: CourierAvailabilityStatus,
    ) {
        super();
    }
}
