import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentProvider } from '../../domain/enums/payment-provider.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { Currency } from '../../domain/enums/currency.enum';
import type { PaymentProps } from '../../domain/entities/payment.entity';

export const TEST_PAYMENT_ID = '110e8400-e29b-41d4-a716-446655440010';
export const TEST_ORDER_ID = '880e8400-e29b-41d4-a716-446655440003';
export const TEST_CUSTOMER_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_RESTAURANT_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_ADMIN_USER_ID = 'cc0e8400-e29b-41d4-a716-446655440007';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildPaymentOverrides = Partial<PaymentProps>;

export function buildPayment(overrides: BuildPaymentOverrides = {}): Payment {
    return Payment.restore({
        id: overrides.id ?? UUID.create(TEST_PAYMENT_ID),
        orderId: overrides.orderId ?? UUID.create(TEST_ORDER_ID),
        provider: overrides.provider ?? PaymentProvider.CASH,
        status: overrides.status ?? PaymentStatus.PENDING,
        amount: overrides.amount ?? 20.0,
        currency: overrides.currency ?? Currency.UAH,
        providerPaymentId: overrides.providerPaymentId !== undefined ? overrides.providerPaymentId : null,
        failureReason: overrides.failureReason !== undefined ? overrides.failureReason : null,
        paidAt: overrides.paidAt !== undefined ? overrides.paidAt : null,
        refundedAt: overrides.refundedAt !== undefined ? overrides.refundedAt : null,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}
