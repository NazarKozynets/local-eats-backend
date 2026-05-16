export type UnblockUserCommandProps = {
    userId: string;
};

export class UnblockUserCommand {
    public readonly userId: string;

    private constructor(props: UnblockUserCommandProps) {
        this.userId = props.userId;
    }

    static create(props: UnblockUserCommandProps): UnblockUserCommand {
        return new UnblockUserCommand({
            userId: props.userId.trim(),
        });
    }
}
