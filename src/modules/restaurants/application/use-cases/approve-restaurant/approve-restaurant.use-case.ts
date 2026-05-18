import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantApprovedEvent } from '../../../domain/events/restaurant-approved.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { ApproveRestaurantCommand } from './approve-restaurant.command';

@Injectable()
export class ApproveRestaurantUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: ApproveRestaurantCommand): Promise<void> {
        const restaurantId = UUID.create(command.restaurantId);
        const restaurant = await this.restaurantRepository.findById(restaurantId);

        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        restaurant.approve(new Date());
        await this.restaurantRepository.save(restaurant);
        await this.eventPublisher.publishAll([new RestaurantApprovedEvent(restaurant.id.value)]);
    }
}
