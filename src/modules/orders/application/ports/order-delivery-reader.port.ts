import type { OrderStatus } from '../../domain/enums/order-status.enum';

export const ORDER_DELIVERY_READER = Symbol('ORDER_DELIVERY_READER');

export type OrderDeliveryView = {
    orderId: string;
    publicCode: string;
    customerId: string;
    customerUserId: string;
    restaurantId: string;
    courierId: string | null;
    status: OrderStatus;
    deliveryAddressText: string;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export interface OrderDeliveryReader {
    findById(orderId: string): Promise<OrderDeliveryView | null>;
    findActiveDeliveryByCourierId(courierProfileId: string): Promise<OrderDeliveryView | null>;
}
