import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderRestaurantAccessDeniedError } from '../../../domain/errors/order-restaurant-access-denied.error';
import {
    ORDER_REPOSITORY,
    type OrderRepository,
} from '../../ports/order.repository.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import type { GetRestaurantOrdersCommand } from './get-restaurant-orders.command';
import type { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class GetRestaurantOrdersUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
    ) {}

    async execute(command: GetRestaurantOrdersCommand): Promise<Order[]> {
        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            command.restaurantId,
        );

        if (!canManage) {
            throw new OrderRestaurantAccessDeniedError();
        }

        return this.orderRepository.findManyByRestaurantId(
            UUID.create(command.restaurantId),
            command.status !== undefined ? { status: command.status } : undefined,
        );
    }
}
