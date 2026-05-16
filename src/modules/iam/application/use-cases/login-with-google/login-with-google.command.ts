export type LoginWithGoogleCommandProps = {
    email: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    deviceName?: string | null;
};

export class LoginWithGoogleCommand {
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

    static create(props: LoginWithGoogleCommandProps): LoginWithGoogleCommand {
        return new LoginWithGoogleCommand({
            email: props.email.trim().toLowerCase(),
            userAgent: props.userAgent?.trim() || null,
            ipAddress: props.ipAddress?.trim() || null,
            deviceName: props.deviceName?.trim() || null,
        });
    }
}
