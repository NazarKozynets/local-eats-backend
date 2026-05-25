export interface AdminPaymentReadModel {
    id: string;
    orderId: string;
    provider: string;
    status: string;
    amount: number;
    currency: string;
    paidAt: Date | null;
    refundedAt: Date | null;
    createdAt: Date;
}

export interface AdminPaymentFilters {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
}

export const ADMIN_PAYMENT_READER = Symbol('ADMIN_PAYMENT_READER');

export interface AdminPaymentReader {
    findMany(filters: AdminPaymentFilters): Promise<AdminPaymentReadModel[]>;
}
