import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { PaymentProvider } from '../enums/payment-provider.enum';
import type { PaymentStatus } from '../enums/payment-status.enum';
import type { Currency } from '../enums/currency.enum';

export class PaymentCreatedEvent extends DomainEvent {
    constructor(
        public readonly paymentId: string,
        public readonly orderId: string,
        public readonly provider: PaymentProvider,
        public readonly status: PaymentStatus,
        public readonly amount: number,
        public readonly currency: Currency,
    ) {
        super();
    }
}
