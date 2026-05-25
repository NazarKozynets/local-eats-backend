export type OrderReviewReadModel = {
    orderId: string;
    status: string;
    customerId: string;
    reviewerUserId: string;
    restaurantId: string;
    courierId: string | null;
};

export const ORDER_REVIEW_READER = Symbol('ORDER_REVIEW_READER');

export interface OrderReviewReader {
    findOrderForReview(orderId: string): Promise<OrderReviewReadModel | null>;
}
