import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderDeliveredEvent } from '../../../deliveries/domain/events/order-delivered.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../../payments/application/ports/order-payment-reader.port';

@Injectable()
export class OnOrderDeliveredHandler {
    private readonly logger = new Logger(OnOrderDeliveredHandler.name);

    constructor(
        @Inject(ORDER_PAYMENT_READER) private readonly orderPaymentReader: OrderPaymentReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: OrderDeliveredEvent): Promise<void> {
        const info = await this.orderPaymentReader.getOrderPaymentInfo(event.orderId);
        if (!info) {
            this.logger.warn(`OrderDeliveredEvent: order info not found for orderId=${event.orderId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: info.customerUserId,
                type: NotificationType.ORDER_STATUS_CHANGED,
                title: 'Order delivered',
                body: 'Your order has been delivered!',
                data: { orderId: event.orderId },
            }),
        );
    }
}
