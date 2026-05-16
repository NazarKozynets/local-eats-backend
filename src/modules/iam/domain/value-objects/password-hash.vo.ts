import {ValueObject} from "../../../../shared/domain/value-objects/value-object.base";

type PasswordHashProps = {
    value: string;
};

export class PasswordHash extends ValueObject<PasswordHashProps> {
    private static readonly MIN_LENGTH = 20;

    private constructor(props: PasswordHashProps) {
        super(props);
    }

    public static create(value: string): PasswordHash {
        const normalized = value.trim();

        if (!normalized) {
            throw new Error('Password hash is required');
        }

        if (normalized.length < PasswordHash.MIN_LENGTH) {
            throw new Error('Password hash is too short');
        }

        if (!PasswordHash.isSupportedHashFormat(normalized)) {
            throw new Error('Unsupported password hash format');
        }

        return new PasswordHash({ value: normalized });
    }

    private static isSupportedHashFormat(value: string): boolean {
        return (
            PasswordHash.isBcryptHash(value) ||
            PasswordHash.isArgon2Hash(value)
        );
    }

    private static isBcryptHash(value: string): boolean {
        return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
    }

    private static isArgon2Hash(value: string): boolean {
        return /^\$argon2(id|i|d)\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9+/]+={0,2}\$[A-Za-z0-9+/]+={0,2}$/.test(value);
    }

    public get value(): string {
        return this.props.value;
    }
}