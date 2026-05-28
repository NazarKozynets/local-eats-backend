import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import type { OrderDeliveryReader, OrderDeliveryView } from '../../application/ports/order-delivery-reader.port';

const ACTIVE_DELIVERY_STATUSES: OrderStatus[] = [
    OrderStatus.ASSIGNED_TO_COURIER,
    OrderStatus.PICKED_UP,
    OrderStatus.DELIVERING,
];

@Injectable()
export class PrismaOrderDeliveryReader implements OrderDeliveryReader {
    constructor(private readonly prisma: PrismaService) {}

    async findById(orderId: string): Promise<OrderDeliveryView | null> {
        const row = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: { select: { userId: true } } },
        });
        return row ? this.toView(row) : null;
    }

    async findActiveDeliveryByCourierId(courierProfileId: string): Promise<OrderDeliveryView | null> {
        const row = await this.prisma.order.findFirst({
            where: {
                courierId: courierProfileId,
                status: { in: ACTIVE_DELIVERY_STATUSES },
            },
            include: { customer: { select: { userId: true } } },
        });
        return row ? this.toView(row) : null;
    }

    private toView(row: any): OrderDeliveryView {
        return {
            orderId: row.id,
            publicCode: row.publicCode,
            customerId: row.customerId,
            customerUserId: row.customer?.userId ?? row.customerId,
            restaurantId: row.restaurantId,
            courierId: row.courierId ?? null,
            status: row.status as OrderStatus,
            deliveryAddressText: row.deliveryAddressText,
            pickedUpAt: row.pickedUpAt ?? null,
            deliveredAt: row.deliveredAt ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
