import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantStaff } from '../../../domain/entities/restaurant-staff.entity';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantStaffAlreadyExistsError } from '../../../domain/errors/restaurant-staff-already-exists.error';
import { RestaurantAccountNotFoundError } from '../../../domain/errors/restaurant-account-not-found.error';
import { RestaurantStaffAddedEvent } from '../../../domain/events/restaurant-staff-added.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    RESTAURANT_STAFF_REPOSITORY,
    type RestaurantStaffRepository,
} from '../../ports/restaurant-staff.repository.port';
import {
    ACCOUNT_ACCESS_READER,
    type AccountAccessReader,
} from '../../../../iam/application/ports/account-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { AddRestaurantStaffCommand } from './add-restaurant-staff.command';

@Injectable()
export class AddRestaurantStaffUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
        @Inject(ACCOUNT_ACCESS_READER)
        private readonly accountAccessReader: AccountAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: AddRestaurantStaffCommand): Promise<void> {
        const restaurantId = UUID.create(command.restaurantId);
        const callerId = UUID.create(command.currentUserId);
        const targetId = UUID.create(command.targetUserId);

        const callerStaff = await this.staffRepository.findByRestaurantAndUser(restaurantId, callerId);
        if (!callerStaff) {
            throw new RestaurantAccessDeniedError();
        }

        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        const targetAccount = await this.accountAccessReader.findById(targetId);
        if (!targetAccount) {
            throw new RestaurantAccountNotFoundError();
        }

        const alreadyExists = await this.staffRepository.exists(restaurantId, targetId);
        if (alreadyExists) {
            throw new RestaurantStaffAlreadyExistsError();
        }

        const newStaff = RestaurantStaff.create({
            id: UUID.generate(),
            restaurantId,
            userId: targetId,
            role: command.role,
        });

        await this.staffRepository.save(newStaff);
        await this.eventPublisher.publishAll([
            new RestaurantStaffAddedEvent(restaurant.id.value, targetId.value, command.role),
        ]);
    }
}
