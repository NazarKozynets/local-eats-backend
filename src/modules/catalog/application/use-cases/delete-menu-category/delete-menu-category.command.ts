export type DeleteMenuCategoryCommandProps = {
    currentUserId: string;
    categoryId: string;
};

export class DeleteMenuCategoryCommand {
    readonly currentUserId: string;
    readonly categoryId: string;

    private constructor(props: DeleteMenuCategoryCommand) {
        Object.assign(this, props);
    }

    static create(props: DeleteMenuCategoryCommandProps): DeleteMenuCategoryCommand {
        return new DeleteMenuCategoryCommand({
            currentUserId: props.currentUserId,
            categoryId: props.categoryId,
        });
    }
}
