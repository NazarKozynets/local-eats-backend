export type VerifyEmailCommandProps = {
    userId: string;
};

export class VerifyEmailCommand {
    public readonly userId: string;

    private constructor(props: VerifyEmailCommandProps) {
        this.userId = props.userId;
    }

    static create(props: VerifyEmailCommandProps): VerifyEmailCommand {
        return new VerifyEmailCommand({
            userId: props.userId.trim(),
        });
    }
}
