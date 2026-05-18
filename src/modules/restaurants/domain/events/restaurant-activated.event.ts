import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantActivatedEvent extends DomainEvent {
    constructor(public readonly restaurantId: string) {
        super();
    }
}
