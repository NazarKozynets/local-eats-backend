import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';
import { InvalidMenuItemPriceError } from '../errors/invalid-menu-item-price.error';

type MenuItemPriceProps = { value: number };

export class MenuItemPrice extends ValueObject<MenuItemPriceProps> {
    private constructor(props: MenuItemPriceProps) {
        super(props);
    }

    static create(value: number): MenuItemPrice {
        if (value < 0) {
            throw new InvalidMenuItemPriceError(
                'Menu item price must be greater than or equal to 0',
            );
        }

        return new MenuItemPrice({ value });
    }

    get value(): number {
        return this.props.value;
    }
}
