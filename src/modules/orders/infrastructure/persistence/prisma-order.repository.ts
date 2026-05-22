import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Order } from '../../domain/entities/order.entity';
import type {
    OrderRepository,
    OrderStatusHistoryInput,
    OrderListFilters,
} from '../../application/ports/order.repository.port';
import { OrderPrismaMapper } from './mappers/order-prisma.mapper';
import { OrderItemPrismaMapper } from './mappers/order-item-prisma.mapper';
import { randomUUID } from 'node:crypto';

const ORDER_INCLUDE = { items: true } as const;

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Order | null> {
        const row = await this.prisma.order.findUnique({
            where: { id: id.value },
            include: ORDER_INCLUDE,
        });

        return row ? OrderPrismaMapper.toDomain(row) : null;
    }

    async findByPublicCode(publicCode: string): Promise<Order | null> {
        const row = await this.prisma.order.findUnique({
            where: { publicCode },
            include: ORDER_INCLUDE,
        });

        return row ? OrderPrismaMapper.toDomain(row) : null;
    }

    async findManyByCustomerId(customerId: UUID): Promise<Order[]> {
        const rows = await this.prisma.order.findMany({
            where: { customerId: customerId.value },
            include: ORDER_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });

        return rows.map(OrderPrismaMapper.toDomain);
    }

    async findManyByRestaurantId(restaurantId: UUID, filters?: OrderListFilters): Promise<Order[]> {
        const rows = await this.prisma.order.findMany({
            where: {
                restaurantId: restaurantId.value,
                ...(filters?.status !== undefined ? { status: filters.status } : {}),
            },
            include: ORDER_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });

        return rows.map(OrderPrismaMapper.toDomain);
    }

    async createWithItems(order: Order, historyEntry: OrderStatusHistoryInput): Promise<void> {
        const orderData = OrderPrismaMapper.toPersistence(order);
        const itemsData = order.items.map((item) => OrderItemPrismaMapper.toPersistence(item));

        await this.prisma.$transaction([
            this.prisma.order.create({ data: orderData }),
            ...itemsData.map((item) => this.prisma.orderItem.create({ data: item })),
            this.prisma.orderStatusHistory.create({
                data: {
                    id: randomUUID(),
                    orderId: order.id.value,
                    status: historyEntry.status,
                    changedByUserId: historyEntry.changedByUserId,
                    comment: historyEntry.comment,
                },
            }),
        ]);
    }

    async saveWithHistory(order: Order, historyEntry: OrderStatusHistoryInput): Promise<void> {
        const data = OrderPrismaMapper.toPersistence(order);

        await this.prisma.$transaction([
            this.prisma.order.update({
                where: { id: data.id },
                data: {
                    status: data.status,
                    paymentStatus: data.paymentStatus,
                    restaurantComment: data.restaurantComment,
                    cancellationReason: data.cancellationReason,
                    acceptedAt: data.acceptedAt,
                    readyAt: data.readyAt,
                    cancelledAt: data.cancelledAt,
                    updatedAt: data.updatedAt,
                },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    id: randomUUID(),
                    orderId: order.id.value,
                    status: historyEntry.status,
                    changedByUserId: historyEntry.changedByUserId,
                    comment: historyEntry.comment,
                },
            }),
        ]);
    }
}
