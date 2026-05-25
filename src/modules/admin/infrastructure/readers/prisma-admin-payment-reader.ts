import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminPaymentReadModel,
    AdminPaymentFilters,
    AdminPaymentReader,
} from '../../application/ports/admin-payment-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminPaymentReader implements AdminPaymentReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminPaymentFilters): Promise<AdminPaymentReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.payment.findMany({
            where: {
                ...(filters.status ? { status: filters.status as never } : {}),
                ...(filters.provider ? { provider: filters.provider as never } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                orderId: true,
                provider: true,
                status: true,
                amount: true,
                currency: true,
                paidAt: true,
                refundedAt: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            orderId: row.orderId,
            provider: row.provider as string,
            status: row.status as string,
            amount: Number(row.amount),
            currency: row.currency as string,
            paidAt: row.paidAt,
            refundedAt: row.refundedAt,
            createdAt: row.createdAt,
        }));
    }
}
