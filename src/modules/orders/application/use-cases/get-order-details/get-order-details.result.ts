import type { OrderStatus } from '../../../domain/enums/order-status.enum';
import type { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import type { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import type { Currency } from '../../../domain/enums/currency.enum';

export type OrderItemResult = {
    id: string;
    menuItemId: string | null;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    comment: string | null;
    totalPriceSnapshot: number;
    createdAt: Date;
};

export type OrderStatusHistoryResult = {
    id: string;
    status: OrderStatus;
    changedByUserId: string | null;
    comment: string | null;
    createdAt: Date;
};

export type OrderDetailsResult = {
    id: string;
    publicCode: string;
    customerId: string;
    restaurantId: string;
    courierId: string | null;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    currency: Currency;
    deliveryAddressText: string;
    customerComment: string | null;
    restaurantComment: string | null;
    cancellationReason: string | null;
    subtotalPrice: number;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    totalPrice: number;
    acceptedAt: Date | null;
    readyAt: Date | null;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    items: OrderItemResult[];
    statusHistory: OrderStatusHistoryResult[];
    createdAt: Date;
    updatedAt: Date;
};
