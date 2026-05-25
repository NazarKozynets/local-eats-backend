export interface AdminOrderReadModel {
    id: string;
    publicCode: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    totalPrice: number;
    currency: string;
    customerId: string;
    restaurantId: string;
    courierId: string | null;
    createdAt: Date;
}

export interface AdminOrderFilters {
    page?: number;
    limit?: number;
    status?: string;
    restaurantId?: string;
    courierId?: string;
    customerId?: string;
}

export const ADMIN_ORDER_READER = Symbol('ADMIN_ORDER_READER');

export interface AdminOrderReader {
    findMany(filters: AdminOrderFilters): Promise<AdminOrderReadModel[]>;
}
