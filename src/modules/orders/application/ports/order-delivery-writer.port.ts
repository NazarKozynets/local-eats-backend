import type { OrderDeliveryView } from './order-delivery-reader.port';

export const ORDER_DELIVERY_WRITER = Symbol('ORDER_DELIVERY_WRITER');

export interface OrderDeliveryWriter {
    assignCourier(orderId: string, courierProfileId: string, actorUserId: string): Promise<OrderDeliveryView>;
    unassignCourier(orderId: string, actorUserId: string): Promise<OrderDeliveryView>;
    markPickedUp(orderId: string, actorUserId: string): Promise<OrderDeliveryView>;
    startDelivering(orderId: string, actorUserId: string): Promise<OrderDeliveryView>;
    markDelivered(orderId: string, actorUserId: string): Promise<OrderDeliveryView>;
    markProblem(orderId: string, actorUserId: string): Promise<OrderDeliveryView>;
}
