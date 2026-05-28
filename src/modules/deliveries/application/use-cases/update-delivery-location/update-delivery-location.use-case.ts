import { Inject, Injectable } from '@nestjs/common';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
} from '../../../../orders/application/ports/order-delivery-reader.port';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../../couriers/application/ports/courier-access-reader.port';
import {
    COURIER_DELIVERY_WRITER,
    type CourierDeliveryWriter,
} from '../../../../couriers/application/ports/courier-delivery-writer.port';
import type { UpdateDeliveryLocationCommand } from './update-delivery-location.command';

const ACTIVE_DELIVERY_STATUSES: OrderStatus[] = [
    OrderStatus.ASSIGNED_TO_COURIER,
    OrderStatus.PICKED_UP,
    OrderStatus.DELIVERING,
];

@Injectable()
export class UpdateDeliveryLocationUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER) private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
        @Inject(COURIER_DELIVERY_WRITER) private readonly courierDeliveryWriter: CourierDeliveryWriter,
    ) {}

    async execute(command: UpdateDeliveryLocationCommand): Promise<void> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (!courier || order.courierId !== courier.courierProfileId) throw new DeliveryAccessDeniedError();
        if (!ACTIVE_DELIVERY_STATUSES.includes(order.status)) throw new DeliveryAccessDeniedError();

        await this.courierDeliveryWriter.updateLocation(courier.courierProfileId, command.latitude, command.longitude);
    }
}
