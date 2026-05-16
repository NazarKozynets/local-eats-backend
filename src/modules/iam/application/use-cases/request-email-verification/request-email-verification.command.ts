export type RequestEmailVerificationCommandProps = {
    userId: string;
};

export class RequestEmailVerificationCommand {
    public readonly userId: string;

    private constructor(props: RequestEmailVerificationCommandProps) {
        this.userId = props.userId;
    }

    static create(props: RequestEmailVerificationCommandProps): RequestEmailVerificationCommand {
        return new RequestEmailVerificationCommand({
            userId: props.userId.trim(),
        });
    }
}
