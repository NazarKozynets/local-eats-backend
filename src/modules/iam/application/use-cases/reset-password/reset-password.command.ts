export type ResetPasswordCommandProps = {
    userId: string;
    newPassword: string;
};

export class ResetPasswordCommand {
    public readonly userId: string;
    public readonly newPassword: string;

    private constructor(props: ResetPasswordCommandProps) {
        this.userId = props.userId;
        this.newPassword = props.newPassword;
    }

    static create(props: ResetPasswordCommandProps): ResetPasswordCommand {
        return new ResetPasswordCommand({
            userId: props.userId.trim(),
            newPassword: props.newPassword,
        });
    }
}
