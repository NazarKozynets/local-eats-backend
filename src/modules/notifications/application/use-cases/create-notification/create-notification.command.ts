import type { NotificationType } from '../../../domain/enums/notification-type.enum';

export class CreateNotificationCommand {
    readonly userId: string;
    readonly type: NotificationType;
    readonly title: string;
    readonly body: string;
    readonly data?: Record<string, unknown> | null;

    private constructor(props: CreateNotificationCommand) {
        Object.assign(this, props);
    }

    static create(props: {
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        data?: Record<string, unknown> | null;
    }): CreateNotificationCommand {
        return new CreateNotificationCommand(props);
    }
}
