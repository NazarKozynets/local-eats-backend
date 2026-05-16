export type LoginWithAppleCommandProps = {
    email: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceName?: string | null;
};

export class LoginWithAppleCommand {
    public readonly email: string;
    public readonly userAgent: string | null;
    public readonly ipAddress: string | null;
    public readonly deviceName: string | null;

    private constructor(props: {
        email: string;
        userAgent: string | null;
        ipAddress: string | null;
        deviceName: string | null;
    }) {
        this.email = props.email;
        this.userAgent = props.userAgent;
        this.ipAddress = props.ipAddress;
        this.deviceName = props.deviceName;
    }

    static create(props: LoginWithAppleCommandProps): LoginWithAppleCommand {
        return new LoginWithAppleCommand({
            email: props.email.trim().toLowerCase(),
            userAgent: props.userAgent?.trim() || null,
            ipAddress: props.ipAddress?.trim() || null,
            deviceName: props.deviceName?.trim() || null,
        });
    }
}
