import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { OrderReviewReader, OrderReviewReadModel } from '../../application/ports/order-review-reader.port';

@Injectable()
export class PrismaOrderReviewReader implements OrderReviewReader {
    constructor(private readonly prisma: PrismaService) {}

    async findOrderForReview(orderId: string): Promise<OrderReviewReadModel | null> {
        const row = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                status: true,
                customerId: true,
                restaurantId: true,
                courierId: true,
                customer: {
                    select: { userId: true },
                },
            },
        });

        if (!row) {
            return null;
        }

        return {
            orderId: row.id,
            status: row.status,
            customerId: row.customerId,
            reviewerUserId: row.customer.userId,
            restaurantId: row.restaurantId,
            courierId: row.courierId ?? null,
        };
    }
}
