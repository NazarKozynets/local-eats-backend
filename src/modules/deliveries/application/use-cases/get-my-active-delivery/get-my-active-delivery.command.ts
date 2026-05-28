export class GetMyActiveDeliveryCommand {
    readonly currentUserId: string;

    private constructor(props: GetMyActiveDeliveryCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string }): GetMyActiveDeliveryCommand {
        return new GetMyActiveDeliveryCommand(props);
    }
}
