export type CreateRestaurantReviewCommand = {
    currentUserId: string;
    orderId: string;
    rating: number;
    comment?: string | null;
};
