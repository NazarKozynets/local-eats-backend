import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminRestaurantReadModel,
    AdminRestaurantFilters,
    AdminRestaurantReader,
} from '../../application/ports/admin-restaurant-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminRestaurantReader implements AdminRestaurantReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminRestaurantFilters): Promise<AdminRestaurantReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.restaurant.findMany({
            where: {
                ...(filters.status ? { status: filters.status as never } : {}),
                ...(filters.verificationStatus ? { verificationStatus: filters.verificationStatus as never } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                city: true,
                status: true,
                verificationStatus: true,
                ratingAvg: true,
                ratingCount: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            city: row.city,
            status: row.status as string,
            verificationStatus: row.verificationStatus as string,
            ratingAvg: row.ratingAvg,
            ratingCount: row.ratingCount,
            createdAt: row.createdAt,
        }));
    }
}
