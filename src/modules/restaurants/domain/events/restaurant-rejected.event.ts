import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantRejectedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly reason: string,
    ) {
        super();
    }
}
