import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class RestaurantReviewCreatedEvent extends DomainEvent {
    constructor(
        public readonly reviewId: string,
        public readonly orderId: string,
        public readonly reviewerUserId: string,
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly rating: number,
    ) {
        super();
    }
}
