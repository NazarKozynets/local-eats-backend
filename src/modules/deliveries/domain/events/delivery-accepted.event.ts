import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class DeliveryAcceptedEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly courierUserId: string,
    ) { super(); }
}
