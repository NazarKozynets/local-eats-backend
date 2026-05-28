import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeliveryAssignedEvent } from '../../../deliveries/domain/events/delivery-assigned.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    COURIER_ACCESS_READER,
    type CourierAccessReader,
} from '../../../couriers/application/ports/courier-access-reader.port';

@Injectable()
export class OnDeliveryAssignedHandler {
    private readonly logger = new Logger(OnDeliveryAssignedHandler.name);

    constructor(
        @Inject(COURIER_ACCESS_READER) private readonly courierAccessReader: CourierAccessReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: DeliveryAssignedEvent): Promise<void> {
        const courier = await this.courierAccessReader.findById(event.courierProfileId);
        if (!courier) {
            this.logger.warn(`DeliveryAssignedEvent: courier profile not found: ${event.courierProfileId}`);
            return;
        }
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: courier.userId,
                type: NotificationType.ORDER_ASSIGNED,
                title: 'New delivery assigned',
                body: 'A delivery has been assigned to you.',
                data: { orderId: event.orderId, courierProfileId: event.courierProfileId },
            }),
        );
    }
}
