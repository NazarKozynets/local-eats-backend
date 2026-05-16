import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerDisplayName } from '../../../domain/value-objects/customer-display-name.vo';
import { CustomerProfile } from '../../../domain/entities/customer-profile.entity';
import { CustomerProfileAlreadyExistsError } from '../../../domain/errors/customer-profile-already-exists.error';
import { CustomerAccountNotFoundError } from '../../../domain/errors/customer-account-not-found.error';
import { CustomerAccountNotActiveError } from '../../../domain/errors/customer-account-not-active.error';
import { CustomerAccountNotCustomerRoleError } from '../../../domain/errors/customer-account-not-customer-role.error';
import { CustomerProfileCreatedEvent } from '../../../domain/events/customer-profile-created.event';
import {
    CUSTOMER_PROFILE_REPOSITORY,
    type CustomerProfileRepository,
} from '../../ports/customer-profile.repository.port';
import {
    ACCOUNT_ACCESS_READER,
    type AccountAccessReader,
} from '../../../../iam/application/ports/account-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { CreateCustomerProfileCommand } from './create-customer-profile.command';

@Injectable()
export class CreateCustomerProfileUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
        @Inject(ACCOUNT_ACCESS_READER)
        private readonly accountAccessReader: AccountAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateCustomerProfileCommand): Promise<void> {
        const userId = UUID.create(command.userId);
        const account = await this.accountAccessReader.findById(userId);

        if (!account) {
            throw new CustomerAccountNotFoundError();
        }

        if (account.status !== 'ACTIVE') {
            throw new CustomerAccountNotActiveError();
        }

        if (account.role !== 'CUSTOMER') {
            throw new CustomerAccountNotCustomerRoleError();
        }

        const alreadyExists = await this.profileRepository.existsByUserId(userId);

        if (alreadyExists) {
            throw new CustomerProfileAlreadyExistsError();
        }

        const displayName = command.displayName
            ? CustomerDisplayName.create(command.displayName)
            : null;

        const profile = CustomerProfile.create({
            id: UUID.generate(),
            userId,
            displayName,
            avatarUrl: command.avatarUrl,
        });

        await this.profileRepository.save(profile);

        await this.eventPublisher.publishAll([
            new CustomerProfileCreatedEvent(profile.id.value, profile.userId.value),
        ]);
    }
}
