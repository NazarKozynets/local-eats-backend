import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantWorkingHour } from '../../../domain/entities/restaurant-working-hour.entity';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantWorkingHoursUpdatedEvent } from '../../../domain/events/restaurant-working-hours-updated.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    RESTAURANT_STAFF_REPOSITORY,
    type RestaurantStaffRepository,
} from '../../ports/restaurant-staff.repository.port';
import {
    RESTAURANT_WORKING_HOUR_REPOSITORY,
    type RestaurantWorkingHourRepository,
} from '../../ports/restaurant-working-hour.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { UpdateRestaurantWorkingHoursCommand } from './update-restaurant-working-hours.command';

@Injectable()
export class UpdateRestaurantWorkingHoursUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(RESTAURANT_WORKING_HOUR_REPOSITORY)
        private readonly workingHourRepository: RestaurantWorkingHourRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateRestaurantWorkingHoursCommand): Promise<void> {
        const restaurantId = UUID.create(command.restaurantId);
        const userId = UUID.create(command.currentUserId);

        const staff = await this.staffRepository.findByRestaurantAndUser(restaurantId, userId);
        if (!staff) {
            throw new RestaurantAccessDeniedError();
        }

        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        const hours = command.hours.map((entry) =>
            RestaurantWorkingHour.create({
                id: UUID.generate(),
                restaurantId,
                dayOfWeek: entry.dayOfWeek,
                opensAt: entry.opensAt,
                closesAt: entry.closesAt,
                isClosed: entry.isClosed,
            }),
        );

        await this.workingHourRepository.replaceForRestaurant(restaurantId, hours);
        await this.eventPublisher.publishAll([
            new RestaurantWorkingHoursUpdatedEvent(restaurant.id.value),
        ]);
    }
}
