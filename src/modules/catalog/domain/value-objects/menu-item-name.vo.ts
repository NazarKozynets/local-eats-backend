import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';
import { InvalidMenuItemNameError } from '../errors/invalid-menu-item-name.error';

type MenuItemNameProps = { value: string };

export class MenuItemName extends ValueObject<MenuItemNameProps> {
    private static readonly MAX_LENGTH = 200;

    private constructor(props: MenuItemNameProps) {
        super(props);
    }

    static create(value: string): MenuItemName {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new InvalidMenuItemNameError('Menu item name must not be empty');
        }

        if (trimmed.length > MenuItemName.MAX_LENGTH) {
            throw new InvalidMenuItemNameError(
                `Menu item name must not exceed ${MenuItemName.MAX_LENGTH} characters`,
            );
        }

        return new MenuItemName({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }
}
