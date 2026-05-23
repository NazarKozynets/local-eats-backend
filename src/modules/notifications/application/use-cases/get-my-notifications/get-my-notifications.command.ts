export class GetMyNotificationsCommand {
    readonly currentUserId: string;
    readonly page?: number;
    readonly limit?: number;
    readonly unreadOnly?: boolean;

    private constructor(props: GetMyNotificationsCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    }): GetMyNotificationsCommand {
        return new GetMyNotificationsCommand(props);
    }
}
