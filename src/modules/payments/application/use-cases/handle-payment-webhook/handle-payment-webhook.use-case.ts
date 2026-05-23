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
import {
    PAYMENT_PROVIDER_PORT,
    type PaymentProviderPort,
} from '../../ports/payment-provider.port';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentNotFoundError } from '../../../domain/errors/payment-not-found.error';
import { PaymentProviderCallbackInvalidError } from '../../../domain/errors/payment-provider-callback-invalid.error';
import type { HandlePaymentWebhookCommand } from './handle-payment-webhook.command';

@Injectable()
export class HandlePaymentWebhookUseCase {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: PaymentRepository,
        @Inject(ORDER_PAYMENT_WRITER)
        private readonly orderPaymentWriter: OrderPaymentWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
        @Inject(PAYMENT_PROVIDER_PORT)
        private readonly paymentProviders: PaymentProviderPort[],
    ) {}

    async execute(command: HandlePaymentWebhookCommand): Promise<void> {
        const provider = this.paymentProviders.find((p) => p.providerName === command.provider);

        if (!provider) {
            throw new PaymentProviderCallbackInvalidError(`Unknown provider: ${command.provider}`);
        }

        let parsed: ReturnType<PaymentProviderPort['parseWebhook']>;
        try {
            parsed = provider.parseWebhook(command.payload);
        } catch {
            throw new PaymentProviderCallbackInvalidError('Failed to parse provider webhook payload');
        }

        const payment = await this.paymentRepository.findById(UUID.create(parsed.paymentId));

        if (!payment) {
            throw new PaymentNotFoundError();
        }

        if (parsed.status === PaymentStatus.PAID) {
            payment.markPaid(parsed.providerPaymentId ?? undefined);
        } else if (parsed.status === PaymentStatus.FAILED) {
            payment.markFailed(parsed.failureReason ?? 'Provider reported failure');
        }

        await this.paymentRepository.update(payment);
        await this.orderPaymentWriter.updateOrderPaymentStatus(payment.orderId.value, payment.status);

        const events = payment.pullDomainEvents();
        await this.eventPublisher.publishAll(events);
    }
}
