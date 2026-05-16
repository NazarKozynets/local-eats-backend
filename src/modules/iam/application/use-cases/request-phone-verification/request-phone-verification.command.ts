export type RequestPhoneVerificationCommandProps = {
    userId: string;
};

export class RequestPhoneVerificationCommand {
    public readonly userId: string;

    private constructor(props: RequestPhoneVerificationCommandProps) {
        this.userId = props.userId;
    }

    static create(props: RequestPhoneVerificationCommandProps): RequestPhoneVerificationCommand {
        return new RequestPhoneVerificationCommand({
            userId: props.userId.trim(),
        });
    }
}
