import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { OrderPaymentReader, OrderPaymentInfo } from '../../application/ports/order-payment-reader.port';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { Currency } from '../../domain/enums/currency.enum';
import type { PaymentMethod } from '../../../orders/domain/enums/payment-method.enum';
import type { OrderStatus } from '../../../orders/domain/enums/order-status.enum';

@Injectable()
export class PrismaOrderPaymentReader implements OrderPaymentReader {
    constructor(private readonly prisma: PrismaService) {}

    async getOrderPaymentInfo(orderId: string): Promise<OrderPaymentInfo | null> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                customerId: true,
                restaurantId: true,
                totalPrice: true,
                currency: true,
                paymentMethod: true,
                paymentStatus: true,
                status: true,
            },
        });

        if (!order) return null;

        return {
            orderId: order.id,
            customerId: order.customerId,
            restaurantId: order.restaurantId,
            totalPrice: Number(order.totalPrice),
            currency: order.currency as Currency,
            paymentMethod: order.paymentMethod as PaymentMethod,
            paymentStatus: order.paymentStatus as PaymentStatus,
            orderStatus: order.status as OrderStatus,
        };
    }

    async canUserAccessOrderPayment(userId: string, orderId: string): Promise<boolean> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                customerId: true,
                restaurantId: true,
                customer: { select: { userId: true } },
            },
        });

        if (!order) return false;

        if (order.customer.userId === userId) return true;

        const isStaff = await this.prisma.restaurantStaff.count({
            where: { restaurantId: order.restaurantId, userId },
        });

        if (isStaff > 0) return true;

        const account = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        return account?.role === 'ADMIN';
    }
}
