export type LogoutAllSessionsCommandProps = {
    userId: string;
};

export class LogoutAllSessionsCommand {
    public readonly userId: string;

    private constructor(props: LogoutAllSessionsCommandProps) {
        this.userId = props.userId;
    }

    static create(props: LogoutAllSessionsCommandProps): LogoutAllSessionsCommand {
        return new LogoutAllSessionsCommand({
            userId: props.userId.trim(),
        });
    }
}
