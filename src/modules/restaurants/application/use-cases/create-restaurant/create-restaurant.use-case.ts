import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { Restaurant } from '../../../domain/entities/restaurant.entity';
import { RestaurantStaff } from '../../../domain/entities/restaurant-staff.entity';
import { RestaurantName } from '../../../domain/value-objects/restaurant-name.vo';
import { RestaurantStaffRole } from '../../../domain/enums/restaurant-staff-role.enum';
import { RestaurantAccountNotFoundError } from '../../../domain/errors/restaurant-account-not-found.error';
import { RestaurantAccountNotActiveError } from '../../../domain/errors/restaurant-account-not-active.error';
import { RestaurantAccountNotManagerRoleError } from '../../../domain/errors/restaurant-account-not-manager-role.error';
import { RestaurantCreatedEvent } from '../../../domain/events/restaurant-created.event';
import { RestaurantStaffAddedEvent } from '../../../domain/events/restaurant-staff-added.event';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    ACCOUNT_ACCESS_READER,
    type AccountAccessReader,
} from '../../../../iam/application/ports/account-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { CreateRestaurantCommand } from './create-restaurant.command';

@Injectable()
export class CreateRestaurantUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(ACCOUNT_ACCESS_READER)
        private readonly accountAccessReader: AccountAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateRestaurantCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const account = await this.accountAccessReader.findById(userId);

        if (!account) {
            throw new RestaurantAccountNotFoundError();
        }

        if (account.status !== 'ACTIVE') {
            throw new RestaurantAccountNotActiveError();
        }

        if (account.role !== 'RESTAURANT_MANAGER') {
            throw new RestaurantAccountNotManagerRoleError();
        }

        const restaurant = Restaurant.create({
            id: UUID.generate(),
            name: RestaurantName.create(command.name),
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

        const ownerStaff = RestaurantStaff.create({
            id: UUID.generate(),
            restaurantId: restaurant.id,
            userId,
            role: RestaurantStaffRole.OWNER,
        });

        await this.restaurantRepository.createWithOwnerStaff(restaurant, ownerStaff);

        await this.eventPublisher.publishAll([
            new RestaurantCreatedEvent(restaurant.id.value, userId.value),
            new RestaurantStaffAddedEvent(restaurant.id.value, userId.value, RestaurantStaffRole.OWNER),
        ]);
    }
}
