import { Inject, Injectable, Optional } from '@nestjs/common';
import { UserRole } from '../../../../iam/domain/enums/user-role.enum';
import { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { DeliveryAccessDeniedError } from '../../../domain/errors/delivery-access-denied.error';
import { OrderNotReadyForDeliveryError } from '../../../domain/errors/order-not-ready-for-delivery.error';
import { CourierNotReadyForDeliveryError } from '../../../domain/errors/courier-not-ready-for-delivery.error';
import { CourierAlreadyHasActiveDeliveryError } from '../../../domain/errors/courier-already-has-active-delivery.error';
import { DeliveryAssignedEvent } from '../../../domain/events/delivery-assigned.event';
import {
    ORDER_DELIVERY_READER,
    type OrderDeliveryReader,
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
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { DISTRIBUTED_LOCK_SERVICE } from '../../../../../shared/infrastructure/redis/redis.tokens';
import type { DistributedLockPort } from '../../../../../shared/infrastructure/redis/distributed-lock.port';
import type { AssignCourierToOrderCommand } from './assign-courier-to-order.command';
import type { OrderDeliveryView } from '../../../../orders/application/ports/order-delivery-reader.port';

@Injectable()
export class AssignCourierToOrderUseCase {
    constructor(
        @Inject(ORDER_DELIVERY_READER)
        private readonly orderDeliveryReader: OrderDeliveryReader,
        @Inject(ORDER_DELIVERY_WRITER)
        private readonly orderDeliveryWriter: OrderDeliveryWriter,
        @Inject(COURIER_ACCESS_READER)
        private readonly courierAccessReader: CourierAccessReader,
        @Inject(COURIER_DELIVERY_WRITER)
        private readonly courierDeliveryWriter: CourierDeliveryWriter,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
        @Optional() @Inject(DISTRIBUTED_LOCK_SERVICE)
        private readonly lockService: DistributedLockPort | null,
    ) {}

    async execute(command: AssignCourierToOrderCommand): Promise<OrderDeliveryView> {
        const order = await this.orderDeliveryReader.findById(command.orderId);
        if (!order) throw new DeliveryNotFoundError();

        const isAdmin = command.actorRole === UserRole.ADMIN;
        if (!isAdmin) {
            const canManage = await this.restaurantAccessReader.canManageRestaurant(
                command.actorUserId,
                order.restaurantId,
            );
            if (!canManage) throw new DeliveryAccessDeniedError();
        }

        if (order.status !== OrderStatus.READY_FOR_PICKUP) throw new OrderNotReadyForDeliveryError();

        const courier = await this.courierAccessReader.findById(command.courierProfileId);
        if (!courier) throw new CourierNotReadyForDeliveryError();
        if (!await this.courierAccessReader.isCourierReadyForDelivery(command.courierProfileId)) {
            throw new CourierNotReadyForDeliveryError();
        }

        const activeDel = await this.orderDeliveryReader.findActiveDeliveryByCourierId(command.courierProfileId);
        if (activeDel) throw new CourierAlreadyHasActiveDeliveryError();

        const lockKey = `delivery:assign-order:${command.orderId}`;
        const lock = this.lockService ? await this.lockService.acquire(lockKey, 10_000) : null;

        try {
            const result = await this.orderDeliveryWriter.assignCourier(
                command.orderId,
                command.courierProfileId,
                command.actorUserId,
            );
            await this.courierDeliveryWriter.markBusy(command.courierProfileId);

            await this.eventPublisher.publishAll([
                new DeliveryAssignedEvent(command.orderId, command.courierProfileId, command.actorUserId),
            ]);

            return result;
        } finally {
            await lock?.release();
        }
    }
}
