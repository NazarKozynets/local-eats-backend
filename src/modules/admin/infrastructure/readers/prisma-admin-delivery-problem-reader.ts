import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminDeliveryProblemReadModel,
    AdminDeliveryProblemFilters,
    AdminDeliveryProblemReader,
} from '../../application/ports/admin-delivery-problem-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminDeliveryProblemReader implements AdminDeliveryProblemReader {
    constructor(private readonly prisma: PrismaService) {}

    async findById(problemId: string): Promise<AdminDeliveryProblemReadModel | null> {
        const row = await this.prisma.deliveryProblemReport.findUnique({
            where: { id: problemId },
            select: {
                id: true,
                orderId: true,
                reportedByUserId: true,
                type: true,
                status: true,
                description: true,
                resolvedAt: true,
                createdAt: true,
            },
        });

        if (!row) return null;

        return {
            id: row.id,
            orderId: row.orderId,
            reportedByUserId: row.reportedByUserId,
            type: row.type as string,
            status: row.status as string,
            description: row.description,
            resolvedAt: row.resolvedAt,
            createdAt: row.createdAt,
        };
    }

    async findMany(filters: AdminDeliveryProblemFilters): Promise<AdminDeliveryProblemReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.deliveryProblemReport.findMany({
            where: {
                ...(filters.status ? { status: filters.status as never } : {}),
                ...(filters.type ? { type: filters.type as never } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                orderId: true,
                reportedByUserId: true,
                type: true,
                status: true,
                description: true,
                resolvedAt: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            orderId: row.orderId,
            reportedByUserId: row.reportedByUserId,
            type: row.type as string,
            status: row.status as string,
            description: row.description,
            resolvedAt: row.resolvedAt,
            createdAt: row.createdAt,
        }));
    }
}
