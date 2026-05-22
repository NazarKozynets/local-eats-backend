import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItemPrismaMapper } from './order-item-prisma.mapper';
import type { OrderStatus } from '../../../domain/enums/order-status.enum';
import type { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import type { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import type { Currency } from '../../../domain/enums/currency.enum';

export class OrderPrismaMapper {
    static toDomain(raw: any): Order {
        const items = (raw.items ?? []).map((item: any) => OrderItemPrismaMapper.toDomain(item));

        return Order.restore({
            id: UUID.create(raw.id),
            publicCode: raw.publicCode,
            customerId: UUID.create(raw.customerId),
            restaurantId: UUID.create(raw.restaurantId),
            courierId: raw.courierId ? UUID.create(raw.courierId) : null,
            status: raw.status as OrderStatus,
            paymentMethod: raw.paymentMethod as PaymentMethod,
            paymentStatus: raw.paymentStatus as PaymentStatus,
            currency: raw.currency as Currency,
            deliveryAddressText: raw.deliveryAddressText,
            customerComment: raw.customerComment ?? null,
            restaurantComment: raw.restaurantComment ?? null,
            cancellationReason: raw.cancellationReason ?? null,
            subtotalPrice: Number(raw.subtotalPrice),
            deliveryFee: Number(raw.deliveryFee),
            serviceFee: Number(raw.serviceFee),
            discountAmount: Number(raw.discountAmount),
            totalPrice: Number(raw.totalPrice),
            acceptedAt: raw.acceptedAt ?? null,
            readyAt: raw.readyAt ?? null,
            pickedUpAt: raw.pickedUpAt ?? null,
            deliveredAt: raw.deliveredAt ?? null,
            cancelledAt: raw.cancelledAt ?? null,
            items,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(order: Order) {
        return {
            id: order.id.value,
            publicCode: order.publicCode,
            customerId: order.customerId.value,
            restaurantId: order.restaurantId.value,
            courierId: order.courierId?.value ?? null,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            currency: order.currency,
            deliveryAddressText: order.deliveryAddressText,
            customerComment: order.customerComment,
            restaurantComment: order.restaurantComment,
            cancellationReason: order.cancellationReason,
            subtotalPrice: order.subtotalPrice,
            deliveryFee: order.deliveryFee,
            serviceFee: order.serviceFee,
            discountAmount: order.discountAmount,
            totalPrice: order.totalPrice,
            acceptedAt: order.acceptedAt,
            readyAt: order.readyAt,
            pickedUpAt: order.pickedUpAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}
