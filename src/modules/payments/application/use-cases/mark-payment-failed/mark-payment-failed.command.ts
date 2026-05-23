export class MarkPaymentFailedCommand {
    readonly paymentId: string;
    readonly reason: string;

    private constructor(props: MarkPaymentFailedCommand) {
        Object.assign(this, props);
    }

    static create(props: { paymentId: string; reason: string }): MarkPaymentFailedCommand {
        return new MarkPaymentFailedCommand({
            paymentId: props.paymentId,
            reason: props.reason,
        });
    }
}
