import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderAccessDeniedError } from '../../../domain/errors/order-access-denied.error';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    ORDER_STATUS_HISTORY_REPOSITORY,
    type OrderStatusHistoryRepository,
} from '../../ports/order-status-history.repository.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    CUSTOMER_ORDER_READER,
    type CustomerOrderReader,
} from '../../ports/customer-order-reader.port';
import type { GetOrderDetailsCommand } from './get-order-details.command';
import type { OrderDetailsResult } from './get-order-details.result';

@Injectable()
export class GetOrderDetailsUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(ORDER_STATUS_HISTORY_REPOSITORY)
        private readonly statusHistoryRepository: OrderStatusHistoryRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(CUSTOMER_ORDER_READER)
        private readonly customerOrderReader: CustomerOrderReader,
    ) {}

    async execute(command: GetOrderDetailsCommand): Promise<OrderDetailsResult> {
        const orderId = UUID.create(command.orderId);
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        const [customerProfile, canManage] = await Promise.all([
            this.customerOrderReader.getProfileByUserId(command.currentUserId),
            this.restaurantAccessReader.canManageRestaurant(command.currentUserId, order.restaurantId.value),
        ]);

        const isOwner = customerProfile != null && order.customerId.value === customerProfile.id;

        if (!isOwner && !canManage) {
            throw new OrderAccessDeniedError();
        }

        const statusHistory = await this.statusHistoryRepository.findManyByOrderId(orderId);

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
            items: order.items.map((item) => ({
                id: item.id.value,
                menuItemId: item.menuItemId?.value ?? null,
                nameSnapshot: item.nameSnapshot,
                priceSnapshot: item.priceSnapshot,
                quantity: item.quantity,
                comment: item.comment,
                totalPriceSnapshot: item.totalPriceSnapshot,
                createdAt: item.createdAt,
            })),
            statusHistory: statusHistory.map((h) => ({
                id: h.id.value,
                status: h.status,
                changedByUserId: h.changedByUserId,
                comment: h.comment,
                createdAt: h.createdAt,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
}
