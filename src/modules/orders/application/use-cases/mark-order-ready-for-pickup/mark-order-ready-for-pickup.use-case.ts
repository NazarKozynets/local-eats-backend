import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderReadyForPickupEvent } from '../../../domain/events/order-ready-for-pickup.event';
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
import type { MarkOrderReadyForPickupCommand } from './mark-order-ready-for-pickup.command';

@Injectable()
export class MarkOrderReadyForPickupUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: MarkOrderReadyForPickupCommand): Promise<void> {
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
        order.markReadyForPickup();

        await this.orderRepository.saveWithHistory(order, {
            status: OrderStatus.READY_FOR_PICKUP,
            changedByUserId: command.currentUserId,
            comment: null,
        });

        await this.eventPublisher.publishAll([
            new OrderReadyForPickupEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                command.currentUserId,
            ),
            new OrderStatusChangedEvent(
                order.id.value,
                order.publicCode,
                order.customerId.value,
                order.restaurantId.value,
                previousStatus,
                OrderStatus.READY_FOR_PICKUP,
                command.currentUserId,
            ),
        ]);
    }
}
