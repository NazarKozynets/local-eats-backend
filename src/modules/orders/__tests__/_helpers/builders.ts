import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { Currency } from '../../domain/enums/currency.enum';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_CUSTOMER_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_RESTAURANT_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_ORDER_ID = '880e8400-e29b-41d4-a716-446655440003';
export const TEST_ITEM_ID = '990e8400-e29b-41d4-a716-446655440004';
export const TEST_ADDRESS_ID = 'aa0e8400-e29b-41d4-a716-446655440005';
export const TEST_OTHER_USER_ID = 'bb0e8400-e29b-41d4-a716-446655440006';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildOrderItemOverrides = Partial<{
    id: UUID;
    orderId: UUID;
    menuItemId: UUID | null;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    comment: string | null;
    totalPriceSnapshot: number;
    createdAt: Date;
}>;

export function buildOrderItem(overrides: BuildOrderItemOverrides = {}): OrderItem {
    const priceSnapshot = overrides.priceSnapshot ?? 10.0;
    const quantity = overrides.quantity ?? 2;
    return OrderItem.restore({
        id: overrides.id ?? UUID.create(TEST_ITEM_ID),
        orderId: overrides.orderId ?? UUID.create(TEST_ORDER_ID),
        menuItemId: overrides.menuItemId !== undefined ? overrides.menuItemId : UUID.create(TEST_ITEM_ID),
        nameSnapshot: overrides.nameSnapshot ?? 'Margherita',
        priceSnapshot,
        quantity,
        comment: overrides.comment !== undefined ? overrides.comment : null,
        totalPriceSnapshot: overrides.totalPriceSnapshot ?? priceSnapshot * quantity,
        createdAt: overrides.createdAt ?? FIXED_DATE,
    });
}

type BuildOrderOverrides = Partial<{
    id: UUID;
    publicCode: string;
    customerId: UUID;
    restaurantId: UUID;
    courierId: UUID | null;
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
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildOrder(overrides: BuildOrderOverrides = {}): Order {
    const items = overrides.items ?? [buildOrderItem()];
    const subtotal = overrides.subtotalPrice ?? 20.0;

    return Order.restore({
        id: overrides.id ?? UUID.create(TEST_ORDER_ID),
        publicCode: overrides.publicCode ?? 'LC-TEST1234',
        customerId: overrides.customerId ?? UUID.create(TEST_CUSTOMER_ID),
        restaurantId: overrides.restaurantId ?? UUID.create(TEST_RESTAURANT_ID),
        courierId: overrides.courierId !== undefined ? overrides.courierId : null,
        status: overrides.status ?? OrderStatus.CREATED,
        paymentMethod: overrides.paymentMethod ?? PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: overrides.paymentStatus ?? PaymentStatus.PENDING,
        currency: overrides.currency ?? Currency.UAH,
        deliveryAddressText: overrides.deliveryAddressText ?? 'Kyiv, Main St 1',
        customerComment: overrides.customerComment !== undefined ? overrides.customerComment : null,
        restaurantComment: overrides.restaurantComment !== undefined ? overrides.restaurantComment : null,
        cancellationReason: overrides.cancellationReason !== undefined ? overrides.cancellationReason : null,
        subtotalPrice: subtotal,
        deliveryFee: overrides.deliveryFee ?? 0,
        serviceFee: overrides.serviceFee ?? 0,
        discountAmount: overrides.discountAmount ?? 0,
        totalPrice: overrides.totalPrice ?? subtotal,
        acceptedAt: overrides.acceptedAt !== undefined ? overrides.acceptedAt : null,
        readyAt: overrides.readyAt !== undefined ? overrides.readyAt : null,
        pickedUpAt: overrides.pickedUpAt !== undefined ? overrides.pickedUpAt : null,
        deliveredAt: overrides.deliveredAt !== undefined ? overrides.deliveredAt : null,
        cancelledAt: overrides.cancelledAt !== undefined ? overrides.cancelledAt : null,
        items,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}
