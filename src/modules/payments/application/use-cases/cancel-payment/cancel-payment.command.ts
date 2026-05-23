export class CancelPaymentCommand {
    readonly paymentId: string;

    private constructor(props: CancelPaymentCommand) {
        Object.assign(this, props);
    }

    static create(props: { paymentId: string }): CancelPaymentCommand {
        return new CancelPaymentCommand({
            paymentId: props.paymentId,
        });
    }
}
