import { Inject, Injectable } from '@nestjs/common';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
    type OrderDeliveryView,
} from '../../../../orders/application/ports/order-delivery-reader.port';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../../couriers/application/ports/courier-access-reader.port';
import type { GetMyActiveDeliveryCommand } from './get-my-active-delivery.command';

@Injectable()
export class GetMyActiveDeliveryUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER) private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
    ) {}

    async execute(command: GetMyActiveDeliveryCommand): Promise<OrderDeliveryView | null> {
        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (!courier) return null;
        return this.orderDeliveryReader.findActiveDeliveryByCourierId(courier.courierProfileId);
    }
}
