import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class OrderDeliveredEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly courierUserId: string,
        public readonly deliveredAt: Date,
    ) { super(); }
}
