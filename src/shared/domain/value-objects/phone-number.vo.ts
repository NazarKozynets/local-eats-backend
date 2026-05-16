import { ValueObject } from './value-object.base';

type PhoneNumberProps = {
    value: string;
};

// Value object for phone number
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
    private static readonly PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

    private constructor(props: PhoneNumberProps) {
        super(props);
    }

    public static create(value: string): PhoneNumber {
        const normalized = PhoneNumber.normalize(value);

        if (!normalized) {
            throw new Error('Phone number is required');
        }

        if (!PhoneNumber.PHONE_REGEX.test(normalized)) {
            throw new Error('Invalid phone number format');
        }

        return new PhoneNumber({ value: normalized });
    }

    private static normalize(value: string): string {
        let normalized = value.trim();

        // Remove spaces, hyphens, brackets and dots
        normalized = normalized.replace(/[\s\-().]/g, '');

        // Convert international prefix 00 to +
        // Example: 00380991112233 -> +380991112233
        if (normalized.startsWith('00')) {
            normalized = `+${normalized.slice(2)}`;
        }

        return normalized;
    }

    public get value(): string {
        return this.props.value;
    }
}