export interface GetAdminReviewsCommand {
    page?: number;
    limit?: number;
    target?: string;
    restaurantId?: string;
    courierId?: string;
}
