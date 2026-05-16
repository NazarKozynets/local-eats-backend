export type BlockUserCommandProps = {
    userId: string;
    reason: string;
    blockedUntil?: Date | null;
};

export class BlockUserCommand {
    public readonly userId: string;
    public readonly reason: string;
    public readonly blockedUntil: Date | null;

    private constructor(props: {
        userId: string;
        reason: string;
        blockedUntil: Date | null;
    }) {
        this.userId = props.userId;
        this.reason = props.reason;
        this.blockedUntil = props.blockedUntil;
    }

    static create(props: BlockUserCommandProps): BlockUserCommand {
        return new BlockUserCommand({
            userId: props.userId.trim(),
            reason: props.reason.trim(),
            blockedUntil: props.blockedUntil ?? null,
        });
    }
}
