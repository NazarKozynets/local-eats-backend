import type { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import { NotificationType } from '../enums/notification-type.enum';
import { InvalidNotificationTitleError } from '../errors/invalid-notification-title.error';
import { InvalidNotificationBodyError } from '../errors/invalid-notification-body.error';
import { InvalidNotificationTypeError } from '../errors/invalid-notification-type.error';
import { NotificationCreatedEvent } from '../events/notification-created.event';

export type NotificationProps = {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    readAt: Date | null;
    createdAt: Date;
};

type CreateNotificationProps = {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
};

export class Notification {
    private readonly _domainEvents: DomainEvent[] = [];
    private constructor(private readonly props: NotificationProps) {}

    static create(p: CreateNotificationProps): Notification {
        const trimmedTitle = p.title.trim();
        if (!trimmedTitle) {
            throw new InvalidNotificationTitleError();
        }

        const trimmedBody = p.body.trim();
        if (!trimmedBody) {
            throw new InvalidNotificationBodyError();
        }

        const validTypes = Object.values(NotificationType) as string[];
        if (!validTypes.includes(p.type)) {
            throw new InvalidNotificationTypeError(String(p.type));
        }

        const notification = new Notification({
            id: p.id,
            userId: p.userId,
            type: p.type,
            title: trimmedTitle,
            body: trimmedBody,
            data: p.data ?? null,
            readAt: null,
            createdAt: new Date(),
        });

        notification._domainEvents.push(
            new NotificationCreatedEvent(p.id, p.userId, p.type),
        );

        return notification;
    }

    static restore(props: NotificationProps): Notification {
        return new Notification(props);
    }

    markAsRead(readAt: Date): void {
        if (this.props.readAt !== null) {
            return;
        }
        this.props.readAt = readAt;
    }

    isRead(): boolean {
        return this.props.readAt !== null;
    }

    belongsTo(userId: string): boolean {
        return this.props.userId === userId;
    }

    pullDomainEvents(): DomainEvent[] {
        const events = [...this._domainEvents];
        this._domainEvents.length = 0;
        return events;
    }

    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get type(): NotificationType { return this.props.type; }
    get title(): string { return this.props.title; }
    get body(): string { return this.props.body; }
    get data(): Record<string, unknown> | null { return this.props.data; }
    get readAt(): Date | null { return this.props.readAt; }
    get createdAt(): Date { return this.props.createdAt; }
}
