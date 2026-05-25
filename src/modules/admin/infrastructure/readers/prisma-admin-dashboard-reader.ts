import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { AdminDashboardReadModel, AdminDashboardReader } from '../../application/ports/admin-dashboard-reader.port';

@Injectable()
export class PrismaAdminDashboardReader implements AdminDashboardReader {
    constructor(private readonly prisma: PrismaService) {}

    async getDashboard(): Promise<AdminDashboardReadModel> {
        const [
            totalUsers,
            totalRestaurants,
            totalCouriers,
            totalOrders,
            revenueResult,
            openDeliveryProblems,
            pendingRestaurantVerifications,
            pendingCourierVerifications,
        ] = await this.prisma.$transaction([
            this.prisma.user.count(),
            this.prisma.restaurant.count(),
            this.prisma.courierProfile.count(),
            this.prisma.order.count(),
            this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
            this.prisma.deliveryProblemReport.count({ where: { status: 'OPEN' } }),
            this.prisma.restaurant.count({ where: { verificationStatus: 'PENDING' } }),
            this.prisma.courierProfile.count({ where: { verificationStatus: 'PENDING' } }),
        ]);

        return {
            totalUsers,
            totalRestaurants,
            totalCouriers,
            totalOrders,
            totalRevenue: (revenueResult._sum.amount ?? 0) as unknown as number,
            openDeliveryProblems,
            pendingRestaurantVerifications,
            pendingCourierVerifications,
        };
    }
}
