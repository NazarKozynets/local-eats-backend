import { Inject, Injectable, Logger } from '@nestjs/common';
import { RestaurantApprovedEvent } from '../../../restaurants/domain/events/restaurant-approved.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../restaurants/application/ports/restaurant-access-reader.port';

@Injectable()
export class OnRestaurantApprovedHandler {
    private readonly logger = new Logger(OnRestaurantApprovedHandler.name);

    constructor(
        @Inject(RESTAURANT_ACCESS_READER) private readonly restaurantAccessReader: RestaurantAccessReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: RestaurantApprovedEvent): Promise<void> {
        const ownerIds = await this.restaurantAccessReader.findOwnerUserIds(event.restaurantId);
        if (ownerIds.length === 0) {
            this.logger.warn(`RestaurantApprovedEvent: no owners found for restaurantId=${event.restaurantId}`);
            return;
        }
        await Promise.all(
            ownerIds.map(userId =>
                this.createNotification.execute(
                    CreateNotificationCommand.create({
                        userId,
                        type: NotificationType.RESTAURANT_VERIFICATION_CHANGED,
                        title: 'Restaurant approved',
                        body: 'Your restaurant has been approved and is now active.',
                        data: { restaurantId: event.restaurantId },
                    }),
                ),
            ),
        );
    }
}
