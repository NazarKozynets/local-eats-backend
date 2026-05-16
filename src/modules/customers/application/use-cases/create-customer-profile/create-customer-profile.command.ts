export type CreateCustomerProfileCommandProps = {
    userId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
};

export class CreateCustomerProfileCommand {
    readonly userId: string;
    readonly displayName: string | null;
    readonly avatarUrl: string | null;

    private constructor(props: {
        userId: string;
        displayName: string | null;
        avatarUrl: string | null;
    }) {
        this.userId = props.userId;
        this.displayName = props.displayName;
        this.avatarUrl = props.avatarUrl;
    }

    static create(props: CreateCustomerProfileCommandProps): CreateCustomerProfileCommand {
        return new CreateCustomerProfileCommand({
            userId: props.userId.trim(),
            displayName: props.displayName?.trim() || null,
            avatarUrl: props.avatarUrl?.trim() || null,
        });
    }
}
