export type CreateMenuItemCommandProps = {
    currentUserId: string;
    restaurantId: string;
    categoryId?: string | null;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number;
    weightGrams?: number | null;
    estimatedCookTime?: number | null;
    isPopular?: boolean;
};

export class CreateMenuItemCommand {
    readonly currentUserId: string;
    readonly restaurantId: string;
    readonly categoryId: string | null;
    readonly name: string;
    readonly description: string | null;
    readonly imageUrl: string | null;
    readonly price: number;
    readonly weightGrams: number | null;
    readonly estimatedCookTime: number | null;
    readonly isPopular: boolean;

    private constructor(props: CreateMenuItemCommand) {
        Object.assign(this, props);
    }

    static create(props: CreateMenuItemCommandProps): CreateMenuItemCommand {
        return new CreateMenuItemCommand({
            currentUserId: props.currentUserId,
            restaurantId: props.restaurantId,
            categoryId: props.categoryId ?? null,
            name: props.name,
            description: props.description ?? null,
            imageUrl: props.imageUrl ?? null,
            price: props.price,
            weightGrams: props.weightGrams ?? null,
            estimatedCookTime: props.estimatedCookTime ?? null,
            isPopular: props.isPopular ?? false,
        });
    }
}
