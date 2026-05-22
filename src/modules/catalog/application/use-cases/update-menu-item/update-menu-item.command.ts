export type UpdateMenuItemCommandProps = {
    currentUserId: string;
    menuItemId: string;
    categoryId?: string | null;
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    price?: number;
    weightGrams?: number | null;
    estimatedCookTime?: number | null;
    isPopular?: boolean;
};

export class UpdateMenuItemCommand {
    readonly currentUserId: string;
    readonly menuItemId: string;
    readonly categoryId: string | null | undefined;
    readonly name: string | undefined;
    readonly description: string | null | undefined;
    readonly imageUrl: string | null | undefined;
    readonly price: number | undefined;
    readonly weightGrams: number | null | undefined;
    readonly estimatedCookTime: number | null | undefined;
    readonly isPopular: boolean | undefined;

    private constructor(props: UpdateMenuItemCommand) {
        Object.assign(this, props);
    }

    static create(props: UpdateMenuItemCommandProps): UpdateMenuItemCommand {
        return new UpdateMenuItemCommand({
            currentUserId: props.currentUserId,
            menuItemId: props.menuItemId,
            categoryId: props.categoryId,
            name: props.name,
            description: props.description,
            imageUrl: props.imageUrl,
            price: props.price,
            weightGrams: props.weightGrams,
            estimatedCookTime: props.estimatedCookTime,
            isPopular: props.isPopular,
        });
    }
}
