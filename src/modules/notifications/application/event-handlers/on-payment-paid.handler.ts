import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentPaidEvent } from '../../../payments/domain/events/payment-paid.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../../payments/application/ports/order-payment-reader.port';

@Injectable()
export class OnPaymentPaidHandler {
    private readonly logger = new Logger(OnPaymentPaidHandler.name);

    constructor(
        @Inject(ORDER_PAYMENT_READER) private readonly orderPaymentReader: OrderPaymentReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: PaymentPaidEvent): Promise<void> {
        const info = await this.orderPaymentReader.getOrderPaymentInfo(event.orderId);
        if (!info) {
            this.logger.warn(`PaymentPaidEvent: order info not found for orderId=${event.orderId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: info.customerUserId,
                type: NotificationType.PAYMENT_STATUS_CHANGED,
                title: 'Payment successful',
                body: 'Your payment has been processed successfully.',
                data: { paymentId: event.paymentId, orderId: event.orderId },
            }),
        );
    }
}
