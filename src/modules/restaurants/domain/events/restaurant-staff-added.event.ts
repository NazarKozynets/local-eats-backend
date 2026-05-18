import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantStaffAddedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly userId: string,
        public readonly role: string,
    ) {
        super();
    }
}
