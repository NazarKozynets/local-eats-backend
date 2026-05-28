import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentFailedEvent } from '../../../payments/domain/events/payment-failed.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../../payments/application/ports/order-payment-reader.port';

@Injectable()
export class OnPaymentFailedHandler {
    private readonly logger = new Logger(OnPaymentFailedHandler.name);

    constructor(
        @Inject(ORDER_PAYMENT_READER) private readonly orderPaymentReader: OrderPaymentReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: PaymentFailedEvent): Promise<void> {
        const info = await this.orderPaymentReader.getOrderPaymentInfo(event.orderId);
        if (!info) {
            this.logger.warn(`PaymentFailedEvent: order info not found for orderId=${event.orderId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: info.customerUserId,
                type: NotificationType.PAYMENT_STATUS_CHANGED,
                title: 'Payment failed',
                body: `Your payment could not be processed. Reason: ${event.failureReason}`,
                data: { paymentId: event.paymentId, orderId: event.orderId, reason: event.failureReason },
            }),
        );
    }
}
