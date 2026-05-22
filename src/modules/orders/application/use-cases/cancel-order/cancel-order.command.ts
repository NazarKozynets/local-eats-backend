export class CancelOrderCommand {
    readonly currentUserId: string;
    readonly orderId: string;
    readonly reason: string | null;

    private constructor(props: CancelOrderCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        orderId: string;
        reason?: string | null;
    }): CancelOrderCommand {
        return new CancelOrderCommand({
            currentUserId: props.currentUserId,
            orderId: props.orderId,
            reason: props.reason ?? null,
        });
    }
}
