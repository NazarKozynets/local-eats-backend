import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Payment } from '../../../domain/entities/payment.entity';
import type { PaymentProvider } from '../../../domain/enums/payment-provider.enum';
import type { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import type { Currency } from '../../../domain/enums/currency.enum';

export class PaymentPrismaMapper {
    static toDomain(raw: {
        id: string;
        orderId: string;
        provider: string;
        status: string;
        amount: unknown;
        currency: string;
        providerPaymentId: string | null;
        failureReason: string | null;
        paidAt: Date | null;
        refundedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }): Payment {
        return Payment.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            provider: raw.provider as PaymentProvider,
            status: raw.status as PaymentStatus,
            amount: Number(raw.amount),
            currency: raw.currency as Currency,
            providerPaymentId: raw.providerPaymentId ?? null,
            failureReason: raw.failureReason ?? null,
            paidAt: raw.paidAt ?? null,
            refundedAt: raw.refundedAt ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(payment: Payment) {
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
