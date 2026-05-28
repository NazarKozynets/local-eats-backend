import { Inject, Injectable } from '@nestjs/common';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryAcceptedEvent } from '../../../domain/events/delivery-accepted.event';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
    type OrderDeliveryView,
} from '../../../../orders/application/ports/order-delivery-reader.port';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../../couriers/application/ports/courier-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { AcceptDeliveryCommand } from './accept-delivery.command';

@Injectable()
export class AcceptDeliveryUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER)
        private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(COURIER_ACCESS_READER)
        private readonly courierAccessReader: CourierAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: AcceptDeliveryCommand): Promise<OrderDeliveryView> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (!courier || order.courierId !== courier.courierProfileId) {
            throw new DeliveryAccessDeniedError();
        }

        if (order.status !== OrderStatus.ASSIGNED_TO_COURIER) {
            throw new DeliveryAccessDeniedError();
        }

        await this.eventPublisher.publishAll([
            new DeliveryAcceptedEvent(order.orderId, command.currentUserId),
        ]);

        return order;
    }
}
