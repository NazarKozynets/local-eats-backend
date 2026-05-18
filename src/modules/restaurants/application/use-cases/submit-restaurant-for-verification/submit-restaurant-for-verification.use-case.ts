import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantSubmittedForVerificationEvent } from '../../../domain/events/restaurant-submitted-for-verification.event';
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
import type { SubmitRestaurantForVerificationCommand } from './submit-restaurant-for-verification.command';

@Injectable()
export class SubmitRestaurantForVerificationUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: SubmitRestaurantForVerificationCommand): Promise<void> {
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

        restaurant.submitForVerification();
        await this.restaurantRepository.save(restaurant);
        await this.eventPublisher.publishAll([
            new RestaurantSubmittedForVerificationEvent(restaurant.id.value),
        ]);
    }
}
