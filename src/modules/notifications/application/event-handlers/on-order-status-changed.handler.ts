import { Injectable } from '@nestjs/common';
import { OrderStatusChangedEvent } from '../../../orders/domain/events/order-status-changed.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class OnOrderStatusChangedHandler {
    constructor(private readonly createNotification: CreateNotificationUseCase) {}

    async handle(event: OrderStatusChangedEvent): Promise<void> {
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: event.actorUserId,
                type: NotificationType.ORDER_STATUS_CHANGED,
                title: 'Order status updated',
                body: `Your order #${event.publicCode} status changed to ${event.newStatus}.`,
                data: {
                    orderId: event.orderId,
                    publicCode: event.publicCode,
                    previousStatus: event.previousStatus,
                    newStatus: event.newStatus,
                },
            }),
        );
    }
}
