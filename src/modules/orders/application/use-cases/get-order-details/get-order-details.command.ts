export class GetOrderDetailsCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: GetOrderDetailsCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string; orderId: string }): GetOrderDetailsCommand {
        return new GetOrderDetailsCommand(props);
    }
}
