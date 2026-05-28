export type OrderCommunicationReadModel = {
    orderId: string;
    customerId: string;
    customerUserId: string;
    restaurantId: string;
    restaurantStaffUserIds: string[];
    courierId: string | null;
    courierUserId: string | null;
};

export const ORDER_COMMUNICATION_READER = Symbol('ORDER_COMMUNICATION_READER');

export interface OrderCommunicationReader {
    findOrderForConversation(orderId: string): Promise<OrderCommunicationReadModel | null>;
}
