export class StartDeliveryCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: StartDeliveryCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string }): StartDeliveryCommand {
        return new StartDeliveryCommand(props);
    }
}
