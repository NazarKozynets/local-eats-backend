export class GetPaymentByOrderCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: GetPaymentByOrderCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string; orderId: string }): GetPaymentByOrderCommand {
        return new GetPaymentByOrderCommand({
            currentUserId: props.currentUserId,
            orderId: props.orderId,
        });
    }
}
