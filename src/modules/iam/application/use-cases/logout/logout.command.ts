export type LogoutCommandProps = {
    refreshToken: string;
};

export class LogoutCommand {
    public readonly refreshToken: string;

    private constructor(props: LogoutCommandProps) {
        this.refreshToken = props.refreshToken;
    }

    static create(props: LogoutCommandProps): LogoutCommand {
        return new LogoutCommand({
            refreshToken: props.refreshToken,
        });
    }
}