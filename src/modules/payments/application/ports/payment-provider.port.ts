import type { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import type { PaymentStatus } from '../../domain/enums/payment-status.enum';

export type CreatePaymentInput = {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
};

export type CreatePaymentOutput = {
    providerPaymentId: string | null;
};

export type ParsedWebhookResult = {
    paymentId: string;
    status: PaymentStatus.PAID | PaymentStatus.FAILED;
    providerPaymentId: string | null;
    failureReason: string | null;
};

export const PAYMENT_PROVIDER_PORT = Symbol('PAYMENT_PROVIDER_PORT');

export interface PaymentProviderPort {
    readonly providerName: PaymentProvider;
    createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput>;
    parseWebhook(payload: Record<string, unknown>): ParsedWebhookResult;
}
