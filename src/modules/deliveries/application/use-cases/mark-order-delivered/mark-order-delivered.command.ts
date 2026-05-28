export class MarkOrderDeliveredCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: MarkOrderDeliveredCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string }): MarkOrderDeliveredCommand {
        return new MarkOrderDeliveredCommand(props);
    }
}
