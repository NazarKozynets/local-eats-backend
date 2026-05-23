import type { PaymentProvider } from '../../../domain/enums/payment-provider.enum';
import type { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import type { Currency } from '../../../domain/enums/currency.enum';

export type GetPaymentByOrderResult = {
    id: string;
    orderId: string;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    providerPaymentId: string | null;
    failureReason: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
