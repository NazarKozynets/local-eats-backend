import type { OrderStatus } from '../../../domain/enums/order-status.enum';

export class GetRestaurantOrdersCommand {
    readonly currentUserId: string;
    readonly restaurantId: string;
    readonly status: OrderStatus | undefined;

    private constructor(props: GetRestaurantOrdersCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        restaurantId: string;
        status?: OrderStatus;
    }): GetRestaurantOrdersCommand {
        return new GetRestaurantOrdersCommand({
            currentUserId: props.currentUserId,
            restaurantId: props.restaurantId,
            status: props.status,
        });
    }
}
