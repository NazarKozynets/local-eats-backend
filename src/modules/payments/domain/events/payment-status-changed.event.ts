import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentStatusChangedEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
        public readonly previousStatus: PaymentStatus,
        public readonly newStatus: PaymentStatus,
    ) {
        super();
    }
}
