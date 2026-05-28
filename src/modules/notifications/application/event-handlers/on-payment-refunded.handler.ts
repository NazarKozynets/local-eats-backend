import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentRefundedEvent } from '../../../payments/domain/events/payment-refunded.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../../payments/application/ports/order-payment-reader.port';

@Injectable()
export class OnPaymentRefundedHandler {
    private readonly logger = new Logger(OnPaymentRefundedHandler.name);

    constructor(
        @Inject(ORDER_PAYMENT_READER) private readonly orderPaymentReader: OrderPaymentReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: PaymentRefundedEvent): Promise<void> {
        const info = await this.orderPaymentReader.getOrderPaymentInfo(event.orderId);
        if (!info) {
            this.logger.warn(`PaymentRefundedEvent: order info not found for orderId=${event.orderId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: info.customerUserId,
                type: NotificationType.PAYMENT_STATUS_CHANGED,
                title: 'Payment refunded',
                body: 'Your payment has been refunded.',
                data: { paymentId: event.paymentId, orderId: event.orderId },
            }),
        );
    }
}
