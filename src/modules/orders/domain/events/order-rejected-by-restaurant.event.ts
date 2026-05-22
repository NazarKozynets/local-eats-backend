import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class OrderRejectedByRestaurantEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly publicCode: string,
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly actorUserId: string,
        public readonly reason: string,
    ) {
        super();
    }
}
