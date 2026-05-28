import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderStatusChangedEvent } from '../../../orders/domain/events/order-status-changed.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../../payments/application/ports/order-payment-reader.port';

@Injectable()
export class OnOrderStatusChangedHandler {
    private readonly logger = new Logger(OnOrderStatusChangedHandler.name);

    constructor(
        @Inject(ORDER_PAYMENT_READER) private readonly orderPaymentReader: OrderPaymentReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: OrderStatusChangedEvent): Promise<void> {
        const info = await this.orderPaymentReader.getOrderPaymentInfo(event.orderId);
        if (!info) {
            this.logger.warn(`OrderStatusChangedEvent: order info not found for orderId=${event.orderId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: info.customerUserId,
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
