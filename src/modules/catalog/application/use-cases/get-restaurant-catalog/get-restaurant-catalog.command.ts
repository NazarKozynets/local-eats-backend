export type GetRestaurantCatalogCommandProps = {
    currentUserId: string;
    restaurantId: string;
};

export class GetRestaurantCatalogCommand {
    readonly currentUserId: string;
    readonly restaurantId: string;

    private constructor(props: GetRestaurantCatalogCommand) {
        Object.assign(this, props);
    }

    static create(props: GetRestaurantCatalogCommandProps): GetRestaurantCatalogCommand {
        return new GetRestaurantCatalogCommand({
            currentUserId: props.currentUserId,
            restaurantId: props.restaurantId,
        });
    }
}
