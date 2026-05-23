export class CreatePaymentCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: CreatePaymentCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string; orderId: string }): CreatePaymentCommand {
        return new CreatePaymentCommand({
            currentUserId: props.currentUserId,
            orderId: props.orderId,
        });
    }
}
