import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantCreatedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly ownerUserId: string,
    ) {
        super();
    }
}
