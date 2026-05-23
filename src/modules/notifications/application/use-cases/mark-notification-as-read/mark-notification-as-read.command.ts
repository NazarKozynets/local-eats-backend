export class MarkNotificationAsReadCommand {
    readonly currentUserId: string;
    readonly notificationId: string;

    private constructor(props: MarkNotificationAsReadCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        currentUserId: string;
        notificationId: string;
    }): MarkNotificationAsReadCommand {
        return new MarkNotificationAsReadCommand(props);
    }
}
