export type UpdateCustomerProfileCommandProps = {
    userId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
};

export class UpdateCustomerProfileCommand {
    readonly userId: string;
    readonly displayName: string | null | undefined;
    readonly avatarUrl: string | null | undefined;

    private constructor(props: {
        userId: string;
        displayName: string | null | undefined;
        avatarUrl: string | null | undefined;
    }) {
        this.userId = props.userId;
        this.displayName = props.displayName;
        this.avatarUrl = props.avatarUrl;
    }

    static create(props: UpdateCustomerProfileCommandProps): UpdateCustomerProfileCommand {
        return new UpdateCustomerProfileCommand({
            userId: props.userId.trim(),
            displayName: props.displayName !== undefined
                ? (props.displayName?.trim() || null)
                : undefined,
            avatarUrl: props.avatarUrl !== undefined
                ? (props.avatarUrl?.trim() || null)
                : undefined,
        });
    }
}
