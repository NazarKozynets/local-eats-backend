import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfile } from '../../../domain/entities/courier-profile.entity';
import { CourierProfileAlreadyExistsError } from '../../../domain/errors/courier-profile-already-exists.error';
import { CourierAccountNotFoundError } from '../../../domain/errors/courier-account-not-found.error';
import { CourierAccountNotActiveError } from '../../../domain/errors/courier-account-not-active.error';
import { CourierAccountNotCourierRoleError } from '../../../domain/errors/courier-account-not-courier-role.error';
import { CourierProfileCreatedEvent } from '../../../domain/events/courier-profile-created.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    ACCOUNT_ACCESS_READER,
    type AccountAccessReader,
} from '../../../../iam/application/ports/account-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { CreateCourierProfileCommand } from './create-courier-profile.command';

@Injectable()
export class CreateCourierProfileUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(ACCOUNT_ACCESS_READER)
        private readonly accountAccessReader: AccountAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: CreateCourierProfileCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const account = await this.accountAccessReader.findById(userId);

        if (!account) {
            throw new CourierAccountNotFoundError();
        }

        if (account.status !== 'ACTIVE') {
            throw new CourierAccountNotActiveError();
        }

        if (account.role !== 'COURIER') {
            throw new CourierAccountNotCourierRoleError();
        }

        const alreadyExists = await this.courierProfileRepository.existsByUserId(userId);
        if (alreadyExists) {
            throw new CourierProfileAlreadyExistsError();
        }

        const profile = CourierProfile.create({
            id: UUID.generate(),
            userId,
            displayName: command.displayName,
            avatarUrl: command.avatarUrl,
            vehicleType: command.vehicleType,
            deliveryRadiusKm: command.deliveryRadiusKm,
        });

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierProfileCreatedEvent(profile.id.value, userId.value),
        ]);
    }
}
