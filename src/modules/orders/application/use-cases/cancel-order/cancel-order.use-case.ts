import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderCancelledEvent } from '../../../domain/events/order-cancelled.event';
import { OrderStatusChangedEvent } from '../../../domain/events/order-status-changed.event';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    CUSTOMER_ORDER_READER,
    type CustomerOrderReader,
} from '../../ports/customer-order-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { OrderCustomerProfileNotFoundError } from '../../../domain/errors/order-customer-profile-not-found.error';
import type { CancelOrderCommand } from './cancel-order.command';

@Injectable()
export class CancelOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(CUSTOMER_ORDER_READER)
        private readonly customerOrderReader: CustomerOrderReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CancelOrderCommand): Promise<void> {
        const profile = await this.customerOrderReader.getProfileByUserId(command.currentUserId);
        if (!profile) {
            throw new OrderCustomerProfileNotFoundError();
        }

        const orderId = UUID.create(command.orderId);
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new OrderNotFoundError();
        }

        const previousStatus = order.status;

        // cancelByCustomer throws OrderAccessDeniedError if not the owner
        // and InvalidOrderCancellationError if not CREATED
        order.cancelByCustomer(profile.id, command.reason);

        await this.orderRepository.saveWithHistory(order, {
            status: OrderStatus.CANCELLED,
            changedByUserId: command.currentUserId,
            comment: command.reason,
        });

        await this.eventPublisher.publishAll([
            new OrderCancelledEvent(
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
                OrderStatus.CANCELLED,
                command.currentUserId,
            ),
        ]);
    }
}
