import { Inject, Injectable, Logger } from '@nestjs/common';
import { RestaurantRejectedEvent } from '../../../restaurants/domain/events/restaurant-rejected.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../use-cases/create-notification/create-notification.command';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../restaurants/application/ports/restaurant-access-reader.port';

@Injectable()
export class OnRestaurantRejectedHandler {
    private readonly logger = new Logger(OnRestaurantRejectedHandler.name);

    constructor(
        @Inject(RESTAURANT_ACCESS_READER) private readonly restaurantAccessReader: RestaurantAccessReader,
        private readonly createNotification: CreateNotificationUseCase,
    ) {}

    async handle(event: RestaurantRejectedEvent): Promise<void> {
        const ownerIds = await this.restaurantAccessReader.findOwnerUserIds(event.restaurantId);
        if (ownerIds.length === 0) {
            this.logger.warn(`RestaurantRejectedEvent: no owners found for restaurantId=${event.restaurantId}`);
            return;
        }
        await Promise.all(
            ownerIds.map(userId =>
                this.createNotification.execute(
                    CreateNotificationCommand.create({
                        userId,
                        type: NotificationType.RESTAURANT_VERIFICATION_CHANGED,
                        title: 'Restaurant rejected',
                        body: `Your restaurant verification was rejected. Reason: ${event.reason}`,
                        data: { restaurantId: event.restaurantId, reason: event.reason },
                    }),
                ),
            ),
        );
    }
}
