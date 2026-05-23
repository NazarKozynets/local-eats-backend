import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class PaymentCancelledEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
    ) {
        super();
    }
}
