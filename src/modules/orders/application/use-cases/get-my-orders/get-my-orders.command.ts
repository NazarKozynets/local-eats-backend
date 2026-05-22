export class GetMyOrdersCommand {
    readonly currentUserId: string;

    private constructor(props: GetMyOrdersCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string }): GetMyOrdersCommand {
        return new GetMyOrdersCommand(props);
    }
}
