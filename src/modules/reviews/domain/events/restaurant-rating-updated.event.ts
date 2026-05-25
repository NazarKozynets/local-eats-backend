import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantRatingUpdatedEvent extends DomainEvent {
    constructor(
        public readonly restaurantId: string,
        public readonly ratingAvg: number,
        public readonly ratingCount: number,
    ) {
        super();
    }
}
