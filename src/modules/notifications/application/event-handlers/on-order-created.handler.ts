import { Injectable } from '@nestjs/common';
import { OrderCreatedEvent } from '../../../orders/domain/events/order-created.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class OnOrderCreatedHandler {
    constructor(private readonly createNotification: CreateNotificationUseCase) {}

    async handle(event: OrderCreatedEvent): Promise<void> {
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: event.actorUserId,
                type: NotificationType.ORDER_CREATED,
                title: 'Order placed',
                body: `Your order #${event.publicCode} has been placed successfully.`,
                data: { orderId: event.orderId, publicCode: event.publicCode },
            }),
        );
    }
}
