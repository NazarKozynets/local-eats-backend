export type RegisterCommandProps = {
    email?: string | null;
    phone?: string | null;
    password: string;
};

export class RegisterCommand {
    public readonly email: string | null;
    public readonly phone: string | null;
    public readonly password: string;

    private constructor(props: {
        email: string | null;
        phone: string | null;
        password: string;
    }) {
        this.email = props.email;
        this.phone = props.phone;
        this.password = props.password;
    }

    static create(props: RegisterCommandProps): RegisterCommand {
        const email = props.email?.trim().toLowerCase() || null;
        const phone = props.phone?.trim() || null;
        const password = props.password;

        return new RegisterCommand({
            email,
            phone,
            password,
        });
    }
}