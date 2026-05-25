export interface AdminReviewReadModel {
    id: string;
    orderId: string;
    reviewerUserId: string;
    target: string;
    restaurantId: string | null;
    courierId: string | null;
    rating: number;
    comment: string | null;
    createdAt: Date;
}

export interface AdminReviewFilters {
    page?: number;
    limit?: number;
    target?: string;
    restaurantId?: string;
    courierId?: string;
}

export const ADMIN_REVIEW_READER = Symbol('ADMIN_REVIEW_READER');

export interface AdminReviewReader {
    findMany(filters: AdminReviewFilters): Promise<AdminReviewReadModel[]>;
}
