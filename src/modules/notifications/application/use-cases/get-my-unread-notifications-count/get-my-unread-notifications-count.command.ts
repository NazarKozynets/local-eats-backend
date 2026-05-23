export class GetMyUnreadNotificationsCountCommand {
    readonly currentUserId: string;

    private constructor(props: GetMyUnreadNotificationsCountCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string }): GetMyUnreadNotificationsCountCommand {
        return new GetMyUnreadNotificationsCountCommand(props);
    }
}
