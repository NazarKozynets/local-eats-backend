import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminOrderReadModel,
    AdminOrderFilters,
    AdminOrderReader,
} from '../../application/ports/admin-order-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminOrderReader implements AdminOrderReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminOrderFilters): Promise<AdminOrderReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.order.findMany({
            where: {
                ...(filters.status ? { status: filters.status as never } : {}),
                ...(filters.restaurantId ? { restaurantId: filters.restaurantId } : {}),
                ...(filters.courierId ? { courierId: filters.courierId } : {}),
                ...(filters.customerId ? { customerId: filters.customerId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                publicCode: true,
                status: true,
                paymentMethod: true,
                paymentStatus: true,
                totalPrice: true,
                currency: true,
                customerId: true,
                restaurantId: true,
                courierId: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            publicCode: row.publicCode,
            status: row.status as string,
            paymentMethod: row.paymentMethod as string,
            paymentStatus: row.paymentStatus as string,
            totalPrice: Number(row.totalPrice),
            currency: row.currency as string,
            customerId: row.customerId,
            restaurantId: row.restaurantId,
            courierId: row.courierId,
            createdAt: row.createdAt,
        }));
    }
}
