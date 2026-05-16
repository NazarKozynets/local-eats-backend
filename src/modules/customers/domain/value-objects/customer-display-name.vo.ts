import { ValueObject } from '../../../../shared/domain/value-objects/value-object.base';

type CustomerDisplayNameProps = {
    value: string;
};

export class CustomerDisplayName extends ValueObject<CustomerDisplayNameProps> {
    private static readonly MAX_LENGTH = 100;

    private constructor(props: CustomerDisplayNameProps) {
        super(props);
    }

    static create(value: string): CustomerDisplayName {
        const trimmed = value.trim();

        if (!trimmed) {
            throw new Error('Display name must not be empty');
        }

        if (trimmed.length > CustomerDisplayName.MAX_LENGTH) {
            throw new Error(`Display name must not exceed ${CustomerDisplayName.MAX_LENGTH} characters`);
        }

        return new CustomerDisplayName({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }
}
