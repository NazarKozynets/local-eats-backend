export interface AdminUserReadModel {
    id: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    createdAt: Date;
    blockedUntil: Date | null;
    blockReason: string | null;
}

export interface AdminUserFilters {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
}

export const ADMIN_USER_READER = Symbol('ADMIN_USER_READER');

export interface AdminUserReader {
    findMany(filters: AdminUserFilters): Promise<AdminUserReadModel[]>;
}
