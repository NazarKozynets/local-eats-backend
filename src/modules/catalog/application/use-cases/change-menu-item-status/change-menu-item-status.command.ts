import type { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';

export type ChangeMenuItemStatusCommandProps = {
    currentUserId: string;
    menuItemId: string;
    status: MenuItemStatus;
};

export class ChangeMenuItemStatusCommand {
    readonly currentUserId: string;
    readonly menuItemId: string;
    readonly status: MenuItemStatus;

    private constructor(props: ChangeMenuItemStatusCommand) {
        Object.assign(this, props);
    }

    static create(props: ChangeMenuItemStatusCommandProps): ChangeMenuItemStatusCommand {
        return new ChangeMenuItemStatusCommand({
            currentUserId: props.currentUserId,
            menuItemId: props.menuItemId,
            status: props.status,
        });
    }
}
