export const RESTAURANT_RATING_WRITER = Symbol('RESTAURANT_RATING_WRITER');

export interface RestaurantRatingWriter {
    updateRating(restaurantId: string, ratingAvg: number, ratingCount: number): Promise<void>;
}
