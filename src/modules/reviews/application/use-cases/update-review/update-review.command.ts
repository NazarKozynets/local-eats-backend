export type UpdateReviewCommand = {
    currentUserId: string;
    reviewId: string;
    rating?: number;
    comment?: string | null;
};
