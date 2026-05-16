export type LoginCommandProps = {
    identifier: string;
    password: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceName?: string | null;
};

export class LoginWithPasswordCommand {
    public readonly identifier: string;
    public readonly password: string;
    public readonly userAgent: string | null;
    public readonly ipAddress: string | null;
    public readonly deviceName: string | null;

    private constructor(props: {
        identifier: string;
        password: string;
        userAgent: string | null;
        ipAddress: string | null;
        deviceName: string | null;
    }) {
        this.identifier = props.identifier;
        this.password = props.password;
        this.userAgent = props.userAgent;
        this.ipAddress = props.ipAddress;
        this.deviceName = props.deviceName;
    }

    static create(props: LoginCommandProps): LoginWithPasswordCommand {
        const identifier = props.identifier.trim().toLowerCase();
        const password = props.password;
        const userAgent = props.userAgent?.trim() || null;
        const ipAddress = props.ipAddress?.trim() || null;
        const deviceName = props.deviceName?.trim() || null;

        return new LoginWithPasswordCommand({
            identifier,
            password,
            userAgent,
            ipAddress,
            deviceName,
        });
    }
}