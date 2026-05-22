export type RestaurantDeliverySettings = {
    deliveryFee: number;
    minOrderAmount: number;
};

export const RESTAURANT_ORDER_READER = Symbol('RESTAURANT_ORDER_READER');

export interface RestaurantOrderReader {
    getDeliverySettings(restaurantId: string): Promise<RestaurantDeliverySettings | null>;
}
