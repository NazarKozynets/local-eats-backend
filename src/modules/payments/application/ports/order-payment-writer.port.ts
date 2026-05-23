import type { PaymentStatus } from '../../domain/enums/payment-status.enum';

export const ORDER_PAYMENT_WRITER = Symbol('ORDER_PAYMENT_WRITER');

export interface OrderPaymentWriter {
    updateOrderPaymentStatus(orderId: string, status: PaymentStatus): Promise<void>;
}
