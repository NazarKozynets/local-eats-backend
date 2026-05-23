import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import {
    PAYMENT_REPOSITORY,
    type PaymentRepository,
} from '../../ports/payment.repository.port';
import {
    ORDER_PAYMENT_WRITER,
    type OrderPaymentWriter,
} from '../../ports/order-payment-writer.port';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import type { RefundPaymentCommand } from './refund-payment.command';

@Injectable()
export class RefundPaymentUseCase {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: PaymentRepository,
        @Inject(ORDER_PAYMENT_WRITER)
        private readonly orderPaymentWriter: OrderPaymentWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RefundPaymentCommand): Promise<void> {
        const payment = await this.paymentRepository.findById(UUID.create(command.paymentId));

        if (!payment) {
            throw new PaymentNotFoundError();
        }

        payment.refund();

        await this.paymentRepository.update(payment);
        await this.orderPaymentWriter.updateOrderPaymentStatus(payment.orderId.value, payment.status);

        const events = payment.pullDomainEvents();
        await this.eventPublisher.publishAll(events);
    }
}
