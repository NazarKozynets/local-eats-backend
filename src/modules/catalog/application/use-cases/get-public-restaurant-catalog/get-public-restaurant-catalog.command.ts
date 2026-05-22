export type GetPublicRestaurantCatalogCommandProps = {
    restaurantId: string;
};

export class GetPublicRestaurantCatalogCommand {
    readonly restaurantId: string;

    private constructor(props: GetPublicRestaurantCatalogCommand) {
        Object.assign(this, props);
    }

    static create(
        props: GetPublicRestaurantCatalogCommandProps,
    ): GetPublicRestaurantCatalogCommand {
        return new GetPublicRestaurantCatalogCommand({
            restaurantId: props.restaurantId,
        });
    }
}
