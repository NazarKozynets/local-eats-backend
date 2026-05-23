import { Injectable } from '@nestjs/common';
import { CourierApprovedEvent } from '../../../couriers/domain/events/courier-approved.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';

@Injectable()
export class OnCourierApprovedHandler {
    constructor(private readonly createNotification: CreateNotificationUseCase) {}

    async handle(event: CourierApprovedEvent): Promise<void> {
        await this.createNotification.execute(
            CreateNotificationCommand.create({
                userId: event.userId,
                type: NotificationType.COURIER_VERIFICATION_CHANGED,
                title: 'Courier verification approved',
                body: 'Your courier profile has been verified. You can now start accepting deliveries.',
                data: { courierProfileId: event.courierProfileId },
            }),
        );
    }
}
