import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class CourierReviewCreatedEvent extends DomainEvent {
    constructor(
        public readonly reviewId: string,
        public readonly orderId: string,
        public readonly reviewerUserId: string,
        public readonly customerId: string,
        public readonly courierId: string,
        public readonly rating: number,
    ) {
        super();
    }
}
