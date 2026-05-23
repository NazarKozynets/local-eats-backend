import { Injectable } from '@nestjs/common';
import { CourierRejectedEvent } from '../../../couriers/domain/events/courier-rejected.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class OnCourierRejectedHandler {
    constructor(private readonly createNotification: CreateNotificationUseCase) {}

    async handle(event: CourierRejectedEvent): Promise<void> {
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: event.userId,
                type: NotificationType.COURIER_VERIFICATION_CHANGED,
                title: 'Courier verification rejected',
                body: `Your courier verification was rejected. Reason: ${event.reason}`,
                data: { courierProfileId: event.courierProfileId, reason: event.reason },
            }),
        );
    }
}
