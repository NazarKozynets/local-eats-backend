import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantActivatedEvent } from '../../../domain/events/restaurant-activated.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    RESTAURANT_STAFF_REPOSITORY,
    type RestaurantStaffRepository,
} from '../../ports/restaurant-staff.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { ActivateRestaurantCommand } from './activate-restaurant.command';

@Injectable()
export class ActivateRestaurantUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: ActivateRestaurantCommand): Promise<void> {
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

        restaurant.activate();
        await this.restaurantRepository.save(restaurant);
        await this.eventPublisher.publishAll([new RestaurantActivatedEvent(restaurant.id.value)]);
    }
}
