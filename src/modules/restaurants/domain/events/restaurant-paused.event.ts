import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantPausedEvent extends DomainEvent {
    constructor(public readonly restaurantId: string) {
        super();
    }
}
