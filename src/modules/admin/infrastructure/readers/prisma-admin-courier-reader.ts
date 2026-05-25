import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    AdminCourierReadModel,
    AdminCourierFilters,
    AdminCourierReader,
} from '../../application/ports/admin-courier-reader.port';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaAdminCourierReader implements AdminCourierReader {
    constructor(private readonly prisma: PrismaService) {}

    async findMany(filters: AdminCourierFilters): Promise<AdminCourierReadModel[]> {
        const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
        const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const rows = await this.prisma.courierProfile.findMany({
            where: {
                ...(filters.verificationStatus ? { verificationStatus: filters.verificationStatus as never } : {}),
                ...(filters.profileStatus ? { profileStatus: filters.profileStatus as never } : {}),
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
                id: true,
                userId: true,
                displayName: true,
                verificationStatus: true,
                profileStatus: true,
                availabilityStatus: true,
                ratingAvg: true,
                ratingCount: true,
                completedDeliveriesCount: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            userId: row.userId,
            displayName: row.displayName,
            verificationStatus: row.verificationStatus as string,
            profileStatus: row.profileStatus as string,
            availabilityStatus: row.availabilityStatus as string,
            ratingAvg: row.ratingAvg,
            ratingCount: row.ratingCount,
            completedDeliveriesCount: row.completedDeliveriesCount,
            createdAt: row.createdAt,
        }));
    }
}
