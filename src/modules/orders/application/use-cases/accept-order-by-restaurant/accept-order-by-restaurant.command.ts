export class AcceptOrderByRestaurantCommand {
    readonly currentUserId: string;
    readonly orderId: string;
    readonly restaurantComment: string | null;

    private constructor(props: AcceptOrderByRestaurantCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        orderId: string;
        restaurantComment?: string | null;
    }): AcceptOrderByRestaurantCommand {
        return new AcceptOrderByRestaurantCommand({
            currentUserId: props.currentUserId,
            orderId: props.orderId,
            restaurantComment: props.restaurantComment ?? null,
        });
    }
}
