export class AssignCourierToOrderCommand {
    readonly actorUserId: string;
    readonly actorRole: string;
    readonly orderId: string;
    readonly courierProfileId: string;

    private constructor(props: AssignCourierToOrderCommand) { Object.assign(this, props); }

    static create(props: {
        actorUserId: string;
        actorRole: string;
        orderId: string;
        courierProfileId: string;
    }): AssignCourierToOrderCommand {
        return new AssignCourierToOrderCommand(props);
    }
}
