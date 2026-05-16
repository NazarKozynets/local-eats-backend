export type DeleteUserCommandProps = {
    userId: string;
};

export class DeleteUserCommand {
    public readonly userId: string;

    private constructor(props: DeleteUserCommandProps) {
        this.userId = props.userId;
    }

    static create(props: DeleteUserCommandProps): DeleteUserCommand {
        return new DeleteUserCommand({
            userId: props.userId.trim(),
        });
    }
}
