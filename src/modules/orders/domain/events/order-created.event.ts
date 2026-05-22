import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class OrderCreatedEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly publicCode: string,
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
