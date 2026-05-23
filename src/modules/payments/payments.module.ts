import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { PAYMENT_REPOSITORY } from './application/ports/payment.repository.port';
import { ORDER_PAYMENT_READER } from './application/ports/order-payment-reader.port';
import { ORDER_PAYMENT_WRITER } from './application/ports/order-payment-writer.port';
import { PAYMENT_PROVIDER_PORT } from './application/ports/payment-provider.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaPaymentRepository } from './infrastructure/persistence/prisma-payment.repository';
import { PrismaOrderPaymentReader } from './infrastructure/readers/prisma-order-payment-reader';
import { PrismaOrderPaymentWriter } from './infrastructure/readers/prisma-order-payment-writer';
import { CashPaymentProvider } from './infrastructure/providers/cash-payment.provider';
import { MockCardPaymentProvider } from './infrastructure/providers/mock-card-payment.provider';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { PaymentProviderSelector } from './application/services/payment-provider-selector';
import { CreatePaymentUseCase } from './application/use-cases/create-payment/create-payment.use-case';
import { GetPaymentByOrderUseCase } from './application/use-cases/get-payment-by-order/get-payment-by-order.use-case';
import { MarkPaymentPaidUseCase } from './application/use-cases/mark-payment-paid/mark-payment-paid.use-case';
import { MarkPaymentFailedUseCase } from './application/use-cases/mark-payment-failed/mark-payment-failed.use-case';
import { RefundPaymentUseCase } from './application/use-cases/refund-payment/refund-payment.use-case';
import { CancelPaymentUseCase } from './application/use-cases/cancel-payment/cancel-payment.use-case';
import { HandlePaymentWebhookUseCase } from './application/use-cases/handle-payment-webhook/handle-payment-webhook.use-case';
import { PaymentsController } from './presentation/http/payments.controller';
import { AdminPaymentsController } from './presentation/http/admin-payments.controller';
import { PaymentWebhooksController } from './presentation/http/payment-webhooks.controller';

@Module({
    imports: [IamModule],
    controllers: [
        PaymentsController,
        AdminPaymentsController,
        PaymentWebhooksController,
    ],
    providers: [
        { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
        { provide: ORDER_PAYMENT_READER, useClass: PrismaOrderPaymentReader },
        { provide: ORDER_PAYMENT_WRITER, useClass: PrismaOrderPaymentWriter },
        { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },
        {
            provide: PAYMENT_PROVIDER_PORT,
            useFactory: (
                cash: CashPaymentProvider,
                mock: MockCardPaymentProvider,
            ) => [cash, mock],
            inject: [CashPaymentProvider, MockCardPaymentProvider],
        },
        CashPaymentProvider,
        MockCardPaymentProvider,
        PaymentProviderSelector,
        CreatePaymentUseCase,
        GetPaymentByOrderUseCase,
        MarkPaymentPaidUseCase,
        MarkPaymentFailedUseCase,
        RefundPaymentUseCase,
        CancelPaymentUseCase,
        HandlePaymentWebhookUseCase,
    ],
})
export class PaymentsModule {}
