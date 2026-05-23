export class MarkAllNotificationsAsReadCommand {
    readonly currentUserId: string;

    private constructor(props: MarkAllNotificationsAsReadCommand) {
        Object.assign(this, props);
    }

    static create(props: { currentUserId: string }): MarkAllNotificationsAsReadCommand {
        return new MarkAllNotificationsAsReadCommand(props);
    }
}
