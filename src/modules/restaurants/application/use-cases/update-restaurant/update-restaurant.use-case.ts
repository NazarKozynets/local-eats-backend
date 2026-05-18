import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantName } from '../../../domain/value-objects/restaurant-name.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantUpdatedEvent } from '../../../domain/events/restaurant-updated.event';
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
import type { UpdateRestaurantCommand } from './update-restaurant.command';

@Injectable()
export class UpdateRestaurantUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateRestaurantCommand): Promise<void> {
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

        restaurant.updateProfile({
            name: command.name !== undefined ? RestaurantName.create(command.name) : undefined,
            description: command.description,
            logoUrl: command.logoUrl,
            coverUrl: command.coverUrl,
            city: command.city,
            addressText: command.addressText,
            phone: command.phone,
            email: command.email,
            minOrderAmount: command.minOrderAmount,
            deliveryFee: command.deliveryFee,
        });

        await this.restaurantRepository.save(restaurant);
        await this.eventPublisher.publishAll([new RestaurantUpdatedEvent(restaurant.id.value)]);
    }
}
