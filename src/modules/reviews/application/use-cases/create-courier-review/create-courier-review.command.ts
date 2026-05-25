export type CreateCourierReviewCommand = {
    currentUserId: string;
    orderId: string;
    rating: number;
    comment?: string | null;
};
