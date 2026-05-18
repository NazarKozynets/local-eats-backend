import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantStaffRemovedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly userId: string,
    ) {
        super();
    }
}
