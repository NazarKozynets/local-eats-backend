import { Injectable } from '@nestjs/common';
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
export class CashPaymentProvider implements PaymentProviderPort {
    readonly providerName = PaymentProvider.CASH;

    async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentOutput> {
        return { providerPaymentId: null };
    }

    parseWebhook(_payload: Record<string, unknown>): ParsedWebhookResult {
        throw new PaymentProviderCallbackInvalidError('CASH provider does not support webhooks');
    }
}
