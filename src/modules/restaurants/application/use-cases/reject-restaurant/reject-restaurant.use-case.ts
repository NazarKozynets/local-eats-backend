import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantRejectedEvent } from '../../../domain/events/restaurant-rejected.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { RejectRestaurantCommand } from './reject-restaurant.command';

@Injectable()
export class RejectRestaurantUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RejectRestaurantCommand): Promise<void> {
        const restaurantId = UUID.create(command.restaurantId);
        const restaurant = await this.restaurantRepository.findById(restaurantId);

        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        restaurant.reject(command.reason);
        await this.restaurantRepository.save(restaurant);
        await this.eventPublisher.publishAll([
            new RestaurantRejectedEvent(restaurant.id.value, command.reason),
        ]);
    }
}
