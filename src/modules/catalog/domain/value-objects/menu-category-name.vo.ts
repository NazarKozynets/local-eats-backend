import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';
import { InvalidMenuCategoryNameError } from '../errors/invalid-menu-category-name.error';

type MenuCategoryNameProps = { value: string };

export class MenuCategoryName extends ValueObject<MenuCategoryNameProps> {
    private static readonly MAX_LENGTH = 100;

    private constructor(props: MenuCategoryNameProps) {
        super(props);
    }

    static create(value: string): MenuCategoryName {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new InvalidMenuCategoryNameError('Menu category name must not be empty');
        }

        if (trimmed.length > MenuCategoryName.MAX_LENGTH) {
            throw new InvalidMenuCategoryNameError(
                `Menu category name must not exceed ${MenuCategoryName.MAX_LENGTH} characters`,
            );
        }

        return new MenuCategoryName({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }
}
