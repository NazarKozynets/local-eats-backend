import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    PAYMENT_REPOSITORY,
    type PaymentRepository,
} from '../../ports/payment.repository.port';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../ports/order-payment-reader.port';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentAccessDeniedError } from '../../../domain/errors/payment-access-denied.error';
import type { GetPaymentByOrderCommand } from './get-payment-by-order.command';
import type { GetPaymentByOrderResult } from './get-payment-by-order.result';

@Injectable()
export class GetPaymentByOrderUseCase {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: PaymentRepository,
        @Inject(ORDER_PAYMENT_READER)
        private readonly orderPaymentReader: OrderPaymentReader,
    ) {}

    async execute(command: GetPaymentByOrderCommand): Promise<GetPaymentByOrderResult> {
        const payment = await this.paymentRepository.findByOrderId(UUID.create(command.orderId));

        if (!payment) {
            throw new PaymentNotFoundError();
        }

        const canAccess = await this.orderPaymentReader.canUserAccessOrderPayment(
            command.currentUserId,
            command.orderId,
        );

        if (!canAccess) {
            throw new PaymentAccessDeniedError();
        }

        return {
            id: payment.id.value,
            orderId: payment.orderId.value,
            provider: payment.provider,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            providerPaymentId: payment.providerPaymentId,
            failureReason: payment.failureReason,
            paidAt: payment.paidAt,
            refundedAt: payment.refundedAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
}
