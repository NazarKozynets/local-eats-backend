import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class OrderPickedUpEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly courierUserId: string,
        public readonly pickedUpAt: Date,
    ) { super(); }
}
