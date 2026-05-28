import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
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
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import type { GetDeliveryDetailsCommand } from './get-delivery-details.command';

@Injectable()
export class GetDeliveryDetailsUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER) private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
        @Inject(RESTAURANT_ACCESS_READER) private readonly restaurantAccessReader: RestaurantAccessReader,
    ) {}

    async execute(command: GetDeliveryDetailsCommand): Promise<OrderDeliveryView> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        if (command.currentUserRole === UserRole.ADMIN) return order;

        const isCustomer = order.customerUserId === command.currentUserId;
        if (isCustomer) return order;

        const courier = await this.courierAccessReader.findByUserId(command.currentUserId);
        if (courier && order.courierId === courier.courierProfileId) return order;

        const isStaff = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            order.restaurantId,
        );
        if (isStaff) return order;

        throw new DeliveryAccessDeniedError();
    }
}
