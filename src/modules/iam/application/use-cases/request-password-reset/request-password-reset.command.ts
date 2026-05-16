export type RequestPasswordResetCommandProps = {
    identifier: string;
};

export class RequestPasswordResetCommand {
    public readonly identifier: string;

    private constructor(props: RequestPasswordResetCommandProps) {
        this.identifier = props.identifier;
    }

    static create(props: RequestPasswordResetCommandProps): RequestPasswordResetCommand {
        return new RequestPasswordResetCommand({
            identifier: props.identifier.trim().toLowerCase(),
        });
    }
}
