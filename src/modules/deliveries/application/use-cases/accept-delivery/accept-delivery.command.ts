export class AcceptDeliveryCommand {
    readonly currentUserId: string;
    readonly orderId: string;

    private constructor(props: AcceptDeliveryCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string }): AcceptDeliveryCommand {
        return new AcceptDeliveryCommand(props);
    }
}
