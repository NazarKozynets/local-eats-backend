export class RejectOrderByRestaurantCommand {
    readonly currentUserId: string;
    readonly orderId: string;
    readonly reason: string;

    private constructor(props: RejectOrderByRestaurantCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        orderId: string;
        reason: string;
    }): RejectOrderByRestaurantCommand {
        return new RejectOrderByRestaurantCommand(props);
    }
}
