import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { OrderPrismaMapper } from '../persistence/mappers/order-prisma.mapper';
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error';
import type { OrderDeliveryWriter, } from '../../application/ports/order-delivery-writer.port';
import type { OrderDeliveryView } from '../../application/ports/order-delivery-reader.port';

type LoadedOrder = {
    order: ReturnType<typeof OrderPrismaMapper.toDomain>;
    customerUserId: string;
};

@Injectable()
export class PrismaOrderDeliveryWriter implements OrderDeliveryWriter {
    constructor(private readonly prisma: PrismaService) {}

    async assignCourier(orderId: string, courierProfileId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.assignCourier(UUID.create(courierProfileId));
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    async unassignCourier(orderId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.unassignCourier();
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    async markPickedUp(orderId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.pickUp(new Date());
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    async startDelivering(orderId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.startDelivering();
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    async markDelivered(orderId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.markDelivered(new Date());
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    async markProblem(orderId: string, actorUserId: string): Promise<OrderDeliveryView> {
        const { order, customerUserId } = await this.loadOrder(orderId);
        order.markProblem();
        await this.saveDeliveryState(order, actorUserId);
        return this.toView(orderId, order, customerUserId);
    }

    private async loadOrder(orderId: string): Promise<LoadedOrder> {
        const raw = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: { select: { userId: true } } },
        });
        if (!raw) throw new OrderNotFoundError();
        return {
            order: OrderPrismaMapper.toDomain(raw),
            customerUserId: raw.customer.userId,
        };
    }

    private async saveDeliveryState(order: ReturnType<typeof OrderPrismaMapper.toDomain>, actorUserId: string): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.order.update({
                where: { id: order.id.value },
                data: {
                    courierId: order.courierId?.value ?? null,
                    status: order.status,
                    pickedUpAt: order.pickedUpAt,
                    deliveredAt: order.deliveredAt,
                    updatedAt: order.updatedAt,
                },
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    id: randomUUID(),
                    orderId: order.id.value,
                    status: order.status,
                    changedByUserId: actorUserId,
                    comment: null,
                },
            }),
        ]);
    }

    private toView(orderId: string, order: ReturnType<typeof OrderPrismaMapper.toDomain>, customerUserId: string): OrderDeliveryView {
        return {
            orderId: order.id.value,
            publicCode: order.publicCode,
            customerId: order.customerId.value,
            customerUserId,
            restaurantId: order.restaurantId.value,
            courierId: order.courierId?.value ?? null,
            status: order.status,
            deliveryAddressText: order.deliveryAddressText,
            pickedUpAt: order.pickedUpAt,
            deliveredAt: order.deliveredAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}
