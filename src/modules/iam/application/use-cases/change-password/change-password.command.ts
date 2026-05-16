export type ChangePasswordCommandProps = {
    userId: string;
    currentPassword: string;
    newPassword: string;
};

export class ChangePasswordCommand {
    public readonly userId: string;
    public readonly currentPassword: string;
    public readonly newPassword: string;

    private constructor(props: ChangePasswordCommandProps) {
        this.userId = props.userId;
        this.currentPassword = props.currentPassword;
        this.newPassword = props.newPassword;
    }

    static create(props: ChangePasswordCommandProps): ChangePasswordCommand {
        return new ChangePasswordCommand({
            userId: props.userId.trim(),
            currentPassword: props.currentPassword,
            newPassword: props.newPassword,
        });
    }
}
