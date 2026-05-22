import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { InvalidOrderItemsError } from '../../../domain/errors/invalid-order-items.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderRejectedByRestaurantEvent } from '../../../domain/events/order-rejected-by-restaurant.event';
import { OrderStatusChangedEvent } from '../../../domain/events/order-status-changed.event';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { RejectOrderByRestaurantCommand } from './reject-order-by-restaurant.command';

@Injectable()
export class RejectOrderByRestaurantUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RejectOrderByRestaurantCommand): Promise<void> {
        if (!command.reason?.trim()) {
            throw new InvalidOrderItemsError('Rejection reason is required');
        }

        const orderId = UUID.create(command.orderId);
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            order.restaurantId.value,
        );

        if (!canManage) {
            throw new OrderRestaurantAccessDeniedError();
        }

        const previousStatus = order.status;
        order.rejectByRestaurant(command.reason);

        await this.orderRepository.saveWithHistory(order, {
            status: OrderStatus.REJECTED_BY_RESTAURANT,
            changedByUserId: command.currentUserId,
            comment: command.reason,
        });

        await this.eventPublisher.publishAll([
            new OrderRejectedByRestaurantEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                command.currentUserId,
                command.reason,
            ),
            new OrderStatusChangedEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                previousStatus,
                OrderStatus.REJECTED_BY_RESTAURANT,
                command.currentUserId,
            ),
        ]);
    }
}
