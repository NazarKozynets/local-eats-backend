export class GetMyCustomerProfileCommand {
    readonly userId: string;

    private constructor(userId: string) {
        this.userId = userId;
    }

    static create(props: { userId: string }): GetMyCustomerProfileCommand {
        return new GetMyCustomerProfileCommand(props.userId.trim());
    }
}
