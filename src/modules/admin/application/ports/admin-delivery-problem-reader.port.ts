export interface AdminDeliveryProblemReadModel {
    id: string;
    orderId: string;
    reportedByUserId: string;
    type: string;
    status: string;
    description: string;
    resolvedAt: Date | null;
    createdAt: Date;
}

export interface AdminDeliveryProblemFilters {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
}

export const ADMIN_DELIVERY_PROBLEM_READER = Symbol('ADMIN_DELIVERY_PROBLEM_READER');

export interface AdminDeliveryProblemReader {
    findById(problemId: string): Promise<AdminDeliveryProblemReadModel | null>;
    findMany(filters: AdminDeliveryProblemFilters): Promise<AdminDeliveryProblemReadModel[]>;
}
