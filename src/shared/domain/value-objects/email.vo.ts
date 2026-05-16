import { ValueObject } from './value-object.base';

type EmailProps = {
    value: string;
};

// Value object for email
export class Email extends ValueObject<EmailProps> {
    private constructor(props: EmailProps) {
        super(props);
    }

    public static create(value: string): Email {
        const normalized = value.trim().toLowerCase();

        if (!normalized) {
            throw new Error('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalized)) {
            throw new Error('Invalid email format');
        }

        return new Email({ value: normalized });
    }

    public get value(): string {
        return this.props.value;
    }
}