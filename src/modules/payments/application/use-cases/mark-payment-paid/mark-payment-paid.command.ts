export class MarkPaymentPaidCommand {
    readonly paymentId: string;
    readonly providerPaymentId: string | null;
    readonly paidAt: Date | null;

    private constructor(props: MarkPaymentPaidCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        paymentId: string;
        providerPaymentId?: string | null;
        paidAt?: Date | null;
    }): MarkPaymentPaidCommand {
        return new MarkPaymentPaidCommand({
            paymentId: props.paymentId,
            providerPaymentId: props.providerPaymentId ?? null,
            paidAt: props.paidAt ?? null,
        });
    }
}
