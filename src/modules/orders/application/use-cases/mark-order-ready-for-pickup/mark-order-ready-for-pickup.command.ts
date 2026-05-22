export class MarkOrderReadyForPickupCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: MarkOrderReadyForPickupCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string; orderId: string }): MarkOrderReadyForPickupCommand {
        return new MarkOrderReadyForPickupCommand(props);
    }
}
