import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    OrderCommunicationReader,
    OrderCommunicationReadModel,
} from '../../application/ports/order-communication-reader.port';

@Injectable()
export class PrismaOrderCommunicationReader implements OrderCommunicationReader {
    constructor(private readonly prisma: PrismaService) {}

    async findOrderForConversation(orderId: string): Promise<OrderCommunicationReadModel | null> {
        const row = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customerId: true,
                restaurantId: true,
                courierId: true,
                customer: { select: { userId: true } },
                courier: { select: { userId: true } },
                restaurant: {
                    select: {
                        staff: { select: { userId: true } },
                    },
                },
            },
        });

        if (!row) return null;

        return {
            orderId: row.id,
            customerId: row.customerId,
            customerUserId: row.customer.userId,
            restaurantId: row.restaurantId,
            restaurantStaffUserIds: row.restaurant.staff.map(s => s.userId),
            courierId: row.courierId,
            courierUserId: row.courier?.userId ?? null,
        };
    }
}
