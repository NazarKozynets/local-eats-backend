export class UpdateDeliveryLocationCommand {
    readonly currentUserId: string;
    readonly orderId: string;
    readonly latitude: number;
    readonly longitude: number;

    private constructor(props: UpdateDeliveryLocationCommand) { Object.assign(this, props); }

    static create(props: { currentUserId: string; orderId: string; latitude: number; longitude: number }): UpdateDeliveryLocationCommand {
        return new UpdateDeliveryLocationCommand(props);
    }
}
