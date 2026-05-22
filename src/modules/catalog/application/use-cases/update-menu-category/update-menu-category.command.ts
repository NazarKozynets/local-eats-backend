export type UpdateMenuCategoryCommandProps = {
    currentUserId: string;
    categoryId: string;
    name?: string;
    position?: number;
    isActive?: boolean;
};

export class UpdateMenuCategoryCommand {
    readonly currentUserId: string;
    readonly categoryId: string;
    readonly name: string | undefined;
    readonly position: number | undefined;
    readonly isActive: boolean | undefined;

    private constructor(props: UpdateMenuCategoryCommand) {
        Object.assign(this, props);
    }

    static create(props: UpdateMenuCategoryCommandProps): UpdateMenuCategoryCommand {
        return new UpdateMenuCategoryCommand({
            currentUserId: props.currentUserId,
            categoryId: props.categoryId,
            name: props.name,
            position: props.position,
            isActive: props.isActive,
        });
    }
}
