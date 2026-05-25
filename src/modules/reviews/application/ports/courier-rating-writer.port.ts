export const COURIER_RATING_WRITER = Symbol('COURIER_RATING_WRITER');

export interface CourierRatingWriter {
    updateRating(courierId: string, ratingAvg: number, ratingCount: number): Promise<void>;
}
