import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';

type RestaurantNameProps = { value: string };

export class RestaurantName extends ValueObject<RestaurantNameProps> {
    private static readonly MAX_LENGTH = 150;

    private constructor(props: RestaurantNameProps) {
        super(props);
    }

    static create(value: string): RestaurantName {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new Error('Restaurant name must not be empty');
        }

        if (trimmed.length > RestaurantName.MAX_LENGTH) {
            throw new Error(`Restaurant name must not exceed ${RestaurantName.MAX_LENGTH} characters`);
        }

        return new RestaurantName({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }
}
