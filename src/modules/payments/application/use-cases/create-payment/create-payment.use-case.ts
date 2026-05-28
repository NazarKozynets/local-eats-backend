import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { Payment } from '../../../domain/entities/payment.entity';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import {
    PAYMENT_REPOSITORY,
    type PaymentRepository,
} from '../../ports/payment.repository.port';
import {
    ORDER_PAYMENT_READER,
    type OrderPaymentReader,
} from '../../ports/order-payment-reader.port';
import {
    ORDER_PAYMENT_WRITER,
    type OrderPaymentWriter,
} from '../../ports/order-payment-writer.port';
import {
    PAYMENT_PROVIDER_PORT,
    type PaymentProviderPort,
} from '../../ports/payment-provider.port';
import { PaymentProviderSelector } from '../../services/payment-provider-selector';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentAlreadyExistsError } from '../../../domain/errors/payment-already-exists.error';
import { PaymentOrderAccessDeniedError } from '../../../domain/errors/payment-order-access-denied.error';
import { OrderNotPayableError } from '../../../domain/errors/order-not-payable.error';
import { InvalidPaymentProviderError } from '../../../domain/errors/invalid-payment-provider.error';
import type { CreatePaymentCommand } from './create-payment.command';

@Injectable()
export class CreatePaymentUseCase {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: PaymentRepository,
        @Inject(ORDER_PAYMENT_READER)
        private readonly orderPaymentReader: OrderPaymentReader,
        @Inject(ORDER_PAYMENT_WRITER)
        private readonly orderPaymentWriter: OrderPaymentWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
        @Inject(PAYMENT_PROVIDER_PORT)
        private readonly paymentProviders: PaymentProviderPort[],
        private readonly providerSelector: PaymentProviderSelector,
    ) {}

    async execute(command: CreatePaymentCommand): Promise<void> {
        const orderInfo = await this.orderPaymentReader.getOrderPaymentInfo(command.orderId);

        if (!orderInfo) {
            throw new PaymentNotFoundError();
        }

        const canAccess = await this.orderPaymentReader.canUserAccessOrderPayment(
            command.currentUserId,
            command.orderId,
        );

        if (!canAccess) {
            throw new PaymentOrderAccessDeniedError();
        }

        const alreadyExists = await this.paymentRepository.existsByOrderId(UUID.create(command.orderId));
        if (alreadyExists) {
            throw new PaymentAlreadyExistsError();
        }

        const payableStatuses: string[] = [
            OrderStatus.CREATED,
            OrderStatus.ACCEPTED_BY_RESTAURANT,
        ];
        if (!payableStatuses.includes(orderInfo.orderStatus)) {
            throw new OrderNotPayableError(`Order in status ${orderInfo.orderStatus} cannot be paid`);
        }

        const providerName = this.providerSelector.select(orderInfo.paymentMethod);
        const provider = this.paymentProviders.find(p => p.providerName === providerName);
        if (!provider) {
            throw new InvalidPaymentProviderError(String(providerName));
        }

        const paymentId = UUID.generate();
        const { providerPaymentId } = await provider.createPayment({
            paymentId: paymentId.value,
            orderId: command.orderId,
            amount: orderInfo.totalPrice,
            currency: orderInfo.currency,
        });

        const payment = Payment.create({
            id: paymentId,
            orderId: UUID.create(command.orderId),
            provider: providerName,
            amount: orderInfo.totalPrice,
            currency: orderInfo.currency,
            providerPaymentId,
        });

        await this.paymentRepository.save(payment);
        await this.orderPaymentWriter.updateOrderPaymentStatus(command.orderId, payment.status);

        const events = payment.pullDomainEvents();
        await this.eventPublisher.publishAll(events);
    }
}
