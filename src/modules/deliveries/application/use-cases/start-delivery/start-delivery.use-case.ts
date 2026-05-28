import { Inject, Injectable } from '@nestjs/common';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { DeliveryStartedEvent } from '../../../domain/events/delivery-started.event';
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
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { StartDeliveryCommand } from './start-delivery.command';

@Injectable()
export class StartDeliveryUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER) private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(ORDER_DELIVERY_WRITER) private readonly orderDeliveryWriter: OrderDeliveryWriter,
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER) private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: StartDeliveryCommand): Promise<OrderDeliveryView> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (!courier || order.courierId !== courier.courierProfileId) throw new DeliveryAccessDeniedError();
        if (order.status !== OrderStatus.PICKED_UP) throw new DeliveryAccessDeniedError();

        const result = await this.orderDeliveryWriter.startDelivering(command.orderId, command.currentUserId);

        await this.eventPublisher.publishAll([
            new DeliveryStartedEvent(command.orderId, command.currentUserId),
        ]);

        return result;
    }
}
