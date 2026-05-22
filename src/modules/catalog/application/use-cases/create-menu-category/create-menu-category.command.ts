export type CreateMenuCategoryCommandProps = {
    currentUserId: string;
    restaurantId: string;
    name: string;
    position?: number;
};

export class CreateMenuCategoryCommand {
    readonly currentUserId: string;
    readonly restaurantId: string;
    readonly name: string;
    readonly position: number | undefined;

    private constructor(props: CreateMenuCategoryCommand) {
        Object.assign(this, props);
    }

    static create(props: CreateMenuCategoryCommandProps): CreateMenuCategoryCommand {
        return new CreateMenuCategoryCommand({
            currentUserId: props.currentUserId,
            restaurantId: props.restaurantId,
            name: props.name,
            position: props.position,
        });
    }
}
