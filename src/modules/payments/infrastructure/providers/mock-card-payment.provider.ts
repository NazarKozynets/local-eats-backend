import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type {
    PaymentProviderPort,
    CreatePaymentInput,
    CreatePaymentOutput,
    ParsedWebhookResult,
} from '../../application/ports/payment-provider.port';
import { PaymentProviderCallbackInvalidError } from '../../domain/errors/payment-provider-callback-invalid.error';

@Injectable()
export class MockCardPaymentProvider implements PaymentProviderPort {
    readonly providerName = PaymentProvider.MOCK;

    async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentOutput> {
        return { providerPaymentId: `mock_${randomUUID()}` };
    }

    parseWebhook(payload: Record<string, unknown>): ParsedWebhookResult {
        const paymentId = payload['paymentId'];
        const status = payload['status'];

        if (typeof paymentId !== 'string' || !paymentId) {
            throw new PaymentProviderCallbackInvalidError('Missing paymentId in mock webhook payload');
        }

        if (status !== 'PAID' && status !== 'FAILED') {
            throw new PaymentProviderCallbackInvalidError(`Invalid status in mock webhook: ${String(status)}`);
        }

        return {
            paymentId,
            status: status === 'PAID' ? PaymentStatus.PAID : PaymentStatus.FAILED,
            providerPaymentId: typeof payload['providerPaymentId'] === 'string' ? payload['providerPaymentId'] : null,
            failureReason: typeof payload['failureReason'] === 'string' ? payload['failureReason'] : null,
        };
    }
}
