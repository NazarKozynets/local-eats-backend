export class RejectDeliveryCommand {
    readonly currentUserId: string;
    readonly orderId: string;
    readonly reason: string | null;

    private constructor(props: RejectDeliveryCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string; reason?: string | null }): RejectDeliveryCommand {
        return new RejectDeliveryCommand({ ...props, reason: props.reason ?? null });
    }
}
