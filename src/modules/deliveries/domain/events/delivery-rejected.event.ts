import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class DeliveryRejectedEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly courierUserId: string,
        public readonly reason: string | null,
    ) { super(); }
}
