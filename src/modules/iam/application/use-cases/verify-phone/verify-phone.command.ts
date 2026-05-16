export type VerifyPhoneCommandProps = {
    userId: string;
};

export class VerifyPhoneCommand {
    public readonly userId: string;

    private constructor(props: VerifyPhoneCommandProps) {
        this.userId = props.userId;
    }

    static create(props: VerifyPhoneCommandProps): VerifyPhoneCommand {
        return new VerifyPhoneCommand({
            userId: props.userId.trim(),
        });
    }
}
