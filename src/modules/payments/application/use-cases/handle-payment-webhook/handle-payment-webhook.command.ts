import type { PaymentProvider } from '../../../domain/enums/payment-provider.enum';

export class HandlePaymentWebhookCommand {
    readonly provider: PaymentProvider;
    readonly payload: Record<string, unknown>;

    private constructor(props: HandlePaymentWebhookCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        provider: PaymentProvider;
        payload: Record<string, unknown>;
    }): HandlePaymentWebhookCommand {
        return new HandlePaymentWebhookCommand({
            provider: props.provider,
            payload: props.payload,
        });
    }
}
