import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AdminDashboardReadModel } from '../../../application/ports/admin-dashboard-reader.port';
import type { AdminUserReadModel } from '../../../application/ports/admin-user-reader.port';
import type { AdminRestaurantReadModel } from '../../../application/ports/admin-restaurant-reader.port';
import type { AdminCourierReadModel } from '../../../application/ports/admin-courier-reader.port';
import type { AdminOrderReadModel } from '../../../application/ports/admin-order-reader.port';
import type { AdminPaymentReadModel } from '../../../application/ports/admin-payment-reader.port';
import type { AdminDeliveryProblemReadModel } from '../../../application/ports/admin-delivery-problem-reader.port';
import type { AdminReviewReadModel } from '../../../application/ports/admin-review-reader.port';

export class AdminDashboardResponseDto {
    @ApiProperty() totalUsers: number;
    @ApiProperty() totalRestaurants: number;
    @ApiProperty() totalCouriers: number;
    @ApiProperty() totalOrders: number;
    @ApiProperty() totalRevenue: number;
    @ApiProperty() openDeliveryProblems: number;
    @ApiProperty() pendingRestaurantVerifications: number;
    @ApiProperty() pendingCourierVerifications: number;

    static from(m: AdminDashboardReadModel): AdminDashboardResponseDto {
        return Object.assign(new AdminDashboardResponseDto(), m);
    }
}

export class AdminUserResponseDto {
    @ApiProperty() id: string;
    @ApiPropertyOptional({ nullable: true }) email: string | null;
    @ApiPropertyOptional({ nullable: true }) phone: string | null;
    @ApiProperty() role: string;
    @ApiProperty() status: string;
    @ApiProperty() createdAt: Date;
    @ApiPropertyOptional({ nullable: true }) blockedUntil: Date | null;
    @ApiPropertyOptional({ nullable: true }) blockReason: string | null;

    static from(m: AdminUserReadModel): AdminUserResponseDto {
        return Object.assign(new AdminUserResponseDto(), m);
    }
}

export class AdminRestaurantResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() name: string;
    @ApiProperty() city: string;
    @ApiProperty() status: string;
    @ApiProperty() verificationStatus: string;
    @ApiProperty() ratingAvg: number;
    @ApiProperty() ratingCount: number;
    @ApiProperty() createdAt: Date;

    static from(m: AdminRestaurantReadModel): AdminRestaurantResponseDto {
        return Object.assign(new AdminRestaurantResponseDto(), m);
    }
}

export class AdminCourierResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() userId: string;
    @ApiPropertyOptional({ nullable: true }) displayName: string | null;
    @ApiProperty() verificationStatus: string;
    @ApiProperty() profileStatus: string;
    @ApiProperty() availabilityStatus: string;
    @ApiProperty() ratingAvg: number;
    @ApiProperty() ratingCount: number;
    @ApiProperty() completedDeliveriesCount: number;
    @ApiProperty() createdAt: Date;

    static from(m: AdminCourierReadModel): AdminCourierResponseDto {
        return Object.assign(new AdminCourierResponseDto(), m);
    }
}

export class AdminOrderResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() publicCode: string;
    @ApiProperty() status: string;
    @ApiProperty() paymentMethod: string;
    @ApiProperty() paymentStatus: string;
    @ApiProperty() totalPrice: number;
    @ApiProperty() currency: string;
    @ApiProperty() customerId: string;
    @ApiProperty() restaurantId: string;
    @ApiPropertyOptional({ nullable: true }) courierId: string | null;
    @ApiProperty() createdAt: Date;

    static from(m: AdminOrderReadModel): AdminOrderResponseDto {
        return Object.assign(new AdminOrderResponseDto(), m);
    }
}

export class AdminPaymentResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() orderId: string;
    @ApiProperty() provider: string;
    @ApiProperty() status: string;
    @ApiProperty() amount: number;
    @ApiProperty() currency: string;
    @ApiPropertyOptional({ nullable: true }) paidAt: Date | null;
    @ApiPropertyOptional({ nullable: true }) refundedAt: Date | null;
    @ApiProperty() createdAt: Date;

    static from(m: AdminPaymentReadModel): AdminPaymentResponseDto {
        return Object.assign(new AdminPaymentResponseDto(), m);
    }
}

export class AdminDeliveryProblemResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() orderId: string;
    @ApiProperty() reportedByUserId: string;
    @ApiProperty() type: string;
    @ApiProperty() status: string;
    @ApiProperty() description: string;
    @ApiPropertyOptional({ nullable: true }) resolvedAt: Date | null;
    @ApiProperty() createdAt: Date;

    static from(m: AdminDeliveryProblemReadModel): AdminDeliveryProblemResponseDto {
        return Object.assign(new AdminDeliveryProblemResponseDto(), m);
    }
}

export class AdminReviewResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() orderId: string;
    @ApiProperty() reviewerUserId: string;
    @ApiProperty() target: string;
    @ApiPropertyOptional({ nullable: true }) restaurantId: string | null;
    @ApiPropertyOptional({ nullable: true }) courierId: string | null;
    @ApiProperty() rating: number;
    @ApiPropertyOptional({ nullable: true }) comment: string | null;
    @ApiProperty() createdAt: Date;

    static from(m: AdminReviewReadModel): AdminReviewResponseDto {
        return Object.assign(new AdminReviewResponseDto(), m);
    }
}
