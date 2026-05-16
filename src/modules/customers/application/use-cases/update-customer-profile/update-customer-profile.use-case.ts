import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerDisplayName } from '../../../domain/value-objects/customer-display-name.vo';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerProfileUpdatedEvent } from '../../../domain/events/customer-profile-updated.event';
import {
    CUSTOMER_PROFILE_REPOSITORY,
    type CustomerProfileRepository,
} from '../../ports/customer-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { UpdateCustomerProfileCommand } from './update-customer-profile.command';

@Injectable()
export class UpdateCustomerProfileUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateCustomerProfileCommand): Promise<void> {
        const userId = UUID.create(command.userId);
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            throw new CustomerProfileNotFoundError();
        }

        const displayName = command.displayName !== undefined
            ? (command.displayName ? CustomerDisplayName.create(command.displayName) : null)
            : undefined;

        profile.update(displayName, command.avatarUrl);

        await this.profileRepository.save(profile);

        await this.eventPublisher.publishAll([
            new CustomerProfileUpdatedEvent(profile.id.value, profile.userId.value),
        ]);
    }
}
