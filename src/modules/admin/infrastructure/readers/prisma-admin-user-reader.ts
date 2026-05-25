import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminUserReadModel,
    AdminUserFilters,
    AdminUserReader,
} from '../../application/ports/admin-user-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminUserReader implements AdminUserReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminUserFilters): Promise<AdminUserReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.user.findMany({
            where: {
                ...(filters.role ? { role: filters.role as never } : {}),
                ...(filters.status ? { status: filters.status as never } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                blockedUntil: true,
                blockReason: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            email: row.email,
            phone: row.phone,
            role: row.role as string,
            status: row.status as string,
            createdAt: row.createdAt,
            blockedUntil: row.blockedUntil,
            blockReason: row.blockReason,
        }));
    }
}
