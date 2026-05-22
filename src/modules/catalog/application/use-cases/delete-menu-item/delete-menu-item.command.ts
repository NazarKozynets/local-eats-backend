export type DeleteMenuItemCommandProps = {
    currentUserId: string;
    menuItemId: string;
};

export class DeleteMenuItemCommand {
    readonly currentUserId: string;
    readonly menuItemId: string;

    private constructor(props: DeleteMenuItemCommand) {
        Object.assign(this, props);
    }

    static create(props: DeleteMenuItemCommandProps): DeleteMenuItemCommand {
        return new DeleteMenuItemCommand({
            currentUserId: props.currentUserId,
            menuItemId: props.menuItemId,
        });
    }
}
