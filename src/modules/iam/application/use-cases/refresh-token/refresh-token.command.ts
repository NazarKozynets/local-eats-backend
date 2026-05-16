export type RefreshTokenCommandProps = {
    refreshToken: string;
};

export class RefreshTokenCommand {
    public readonly refreshToken: string;

    private constructor(props: RefreshTokenCommandProps) {
        this.refreshToken = props.refreshToken;
    }

    static create(props: RefreshTokenCommandProps): RefreshTokenCommand {
        return new RefreshTokenCommand({
            refreshToken: props.refreshToken,
        });
    }
}
