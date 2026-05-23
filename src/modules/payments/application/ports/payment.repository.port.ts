import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { Payment } from '../../domain/entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepository {
    findById(id: UUID): Promise<Payment | null>;
    findByOrderId(orderId: UUID): Promise<Payment | null>;
    findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
    existsByOrderId(orderId: UUID): Promise<boolean>;
    save(payment: Payment): Promise<void>;
    update(payment: Payment): Promise<void>;
}
