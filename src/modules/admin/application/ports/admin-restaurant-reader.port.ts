export interface AdminRestaurantReadModel {
    id: string;
    name: string;
    city: string;
    status: string;
    verificationStatus: string;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
}

export interface AdminRestaurantFilters {
    page?: number;
    limit?: number;
    status?: string;
    verificationStatus?: string;
}

export const ADMIN_RESTAURANT_READER = Symbol('ADMIN_RESTAURANT_READER');

export interface AdminRestaurantReader {
    findMany(filters: AdminRestaurantFilters): Promise<AdminRestaurantReadModel[]>;
}
