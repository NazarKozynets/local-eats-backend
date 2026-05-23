import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class PaymentPaidEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
        public readonly providerPaymentId: string | null,
        public readonly paidAt: Date,
    ) {
        super();
    }
}
