export type GetCurrentUserCommandProps = {
    userId: string;
};

export class GetCurrentUserCommand {
    public readonly userId: string;

    private constructor(props: GetCurrentUserCommandProps) {
        this.userId = props.userId;
    }

    static create(props: GetCurrentUserCommandProps): GetCurrentUserCommand {
        return new GetCurrentUserCommand({
            userId: props.userId.trim(),
        });
    }
}
