import { randomUUID } from 'node:crypto';
import {ValueObject} from "./value-object.base";

type UUIDProps = {
    value: string;
};

export class UUID extends ValueObject<UUIDProps> {
    private static readonly UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(props: UUIDProps) {
        super(props);
    }

    public static generate(): UUID {
        return new UUID({
            value: randomUUID(),
        });
    }

    public static create(value: string): UUID {
        const normalized = value.trim();

        if (!normalized) {
            throw new Error('User id is required');
        }

        if (!UUID.UUID_REGEX.test(normalized)) {
            throw new Error('Invalid user id format');
        }

        return new UUID({
            value: normalized,
        });
    }

    public get value(): string {
        return this.props.value;
    }

    public toString(): string {
        return this.props.value;
    }
}