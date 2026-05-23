import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class PaymentFailedEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
        public readonly failureReason: string,
    ) {
        super();
    }
}
