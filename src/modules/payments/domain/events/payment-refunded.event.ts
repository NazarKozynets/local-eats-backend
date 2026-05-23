import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class PaymentRefundedEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
        public readonly refundedAt: Date,
    ) {
        super();
    }
}
