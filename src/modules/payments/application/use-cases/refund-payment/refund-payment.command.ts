export class RefundPaymentCommand {
    readonly paymentId: string;
    readonly actorUserId: string;
    readonly reason: string | null;

    private constructor(props: RefundPaymentCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        paymentId: string;
        actorUserId: string;
        reason?: string | null;
    }): RefundPaymentCommand {
        return new RefundPaymentCommand({
            paymentId: props.paymentId,
            actorUserId: props.actorUserId,
            reason: props.reason ?? null,
        });
    }
}
