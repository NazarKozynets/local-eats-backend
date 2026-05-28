import type { PaymentMethod } from '../../../orders/domain/enums/payment-method.enum';
import type { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type { Currency } from '../../domain/enums/currency.enum';
import type { OrderStatus } from '../../../orders/domain/enums/order-status.enum';

export type OrderPaymentInfo = {
    orderId: string;
    customerId: string;
    customerUserId: string;
    restaurantId: string;
    totalPrice: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
};

export const ORDER_PAYMENT_READER = Symbol('ORDER_PAYMENT_READER');

export interface OrderPaymentReader {
    getOrderPaymentInfo(orderId: string): Promise<OrderPaymentInfo | null>;
    canUserAccessOrderPayment(userId: string, orderId: string): Promise<boolean>;
}
