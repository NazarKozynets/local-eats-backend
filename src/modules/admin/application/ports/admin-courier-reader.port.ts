export interface AdminCourierReadModel {
    id: string;
    userId: string;
    displayName: string | null;
    verificationStatus: string;
    profileStatus: string;
    availabilityStatus: string;
    ratingAvg: number;
    ratingCount: number;
    completedDeliveriesCount: number;
    createdAt: Date;
}

export interface AdminCourierFilters {
    page?: number;
    limit?: number;
    verificationStatus?: string;
    profileStatus?: string;
}

export const ADMIN_COURIER_READER = Symbol('ADMIN_COURIER_READER');

export interface AdminCourierReader {
    findMany(filters: AdminCourierFilters): Promise<AdminCourierReadModel[]>;
}
