export class GetDeliveryDetailsCommand {
    readonly currentUserId: string;
    readonly currentUserRole: string;
    readonly orderId: string;

    private constructor(props: GetDeliveryDetailsCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; currentUserRole: string; orderId: string }): GetDeliveryDetailsCommand {
        return new GetDeliveryDetailsCommand(props);
    }
}
