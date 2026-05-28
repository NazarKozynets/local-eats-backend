export class MarkOrderPickedUpCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: MarkOrderPickedUpCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string }): MarkOrderPickedUpCommand {
        return new MarkOrderPickedUpCommand(props);
    }
}
