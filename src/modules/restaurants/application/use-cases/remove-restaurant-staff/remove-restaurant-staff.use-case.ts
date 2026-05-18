import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantStaffNotFoundError } from '../../../domain/errors/restaurant-staff-not-found.error';
import { RestaurantOwnerCannotBeRemovedError } from '../../../domain/errors/restaurant-owner-cannot-be-removed.error';
import { RestaurantStaffRemovedEvent } from '../../../domain/events/restaurant-staff-removed.event';
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
import type { RemoveRestaurantStaffCommand } from './remove-restaurant-staff.command';

@Injectable()
export class RemoveRestaurantStaffUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RemoveRestaurantStaffCommand): Promise<void> {
        const restaurantId = UUID.create(command.restaurantId);
        const callerId = UUID.create(command.currentUserId);
        const staffId = UUID.create(command.staffId);

        const callerStaff = await this.staffRepository.findByRestaurantAndUser(restaurantId, callerId);
        if (!callerStaff) {
            throw new RestaurantAccessDeniedError();
        }

        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        const staffByRestaurant = await this.staffRepository.findManyByRestaurantId(restaurantId);
        const target = staffByRestaurant.find((s) => s.id.value === staffId.value);

        if (!target) {
            throw new RestaurantStaffNotFoundError();
        }

        if (target.isOwner()) {
            throw new RestaurantOwnerCannotBeRemovedError();
        }

        await this.staffRepository.delete(staffId);
        await this.eventPublisher.publishAll([
            new RestaurantStaffRemovedEvent(restaurant.id.value, target.userId.value),
        ]);
    }
}
