import { Inject, Injectable } from '@nestjs/common';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryRejectedEvent } from '../../../domain/events/delivery-rejected.event';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
    type OrderDeliveryView,
} from '../../../../orders/application/ports/order-delivery-reader.port';
import {
    ORDER_DELIVERY_WRITER,
    type OrderDeliveryWriter,
} from '../../../../orders/application/ports/order-delivery-writer.port';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../../couriers/application/ports/courier-access-reader.port';
import {
    COURIER_DELIVERY_WRITER,
    type CourierDeliveryWriter,
} from '../../../../couriers/application/ports/courier-delivery-writer.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { RejectDeliveryCommand } from './reject-delivery.command';

@Injectable()
export class RejectDeliveryUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER)
        private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(ORDER_DELIVERY_WRITER)
        private readonly orderDeliveryWriter: OrderDeliveryWriter,
        @Inject(COURIER_ACCESS_READER)
        private readonly courierAccessReader: CourierAccessReader,
        @Inject(COURIER_DELIVERY_WRITER)
        private readonly courierDeliveryWriter: CourierDeliveryWriter,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RejectDeliveryCommand): Promise<OrderDeliveryView> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (!courier || order.courierId !== courier.courierProfileId) {
            throw new DeliveryAccessDeniedError();
        }
        if (order.status !== OrderStatus.ASSIGNED_TO_COURIER) {
            throw new DeliveryAccessDeniedError();
        }

        const result = await this.orderDeliveryWriter.unassignCourier(command.orderId, command.currentUserId);
        await this.courierDeliveryWriter.markOnline(courier.courierProfileId);

        await this.eventPublisher.publishAll([
            new DeliveryRejectedEvent(command.orderId, command.currentUserId, command.reason),
        ]);

        return result;
    }
}
