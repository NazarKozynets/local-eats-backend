import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierAccessDeniedError } from '../../../domain/errors/courier-access-denied.error';
import { CourierProfileUpdatedEvent } from '../../../domain/events/courier-profile-updated.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { UpdateCourierProfileCommand } from './update-courier-profile.command';

@Injectable()
export class UpdateCourierProfileUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateCourierProfileCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const profile = await this.courierProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        if (profile.userId.value !== command.currentUserId) {
            throw new CourierAccessDeniedError();
        }

        profile.updateProfile({
            displayName: command.displayName,
            avatarUrl: command.avatarUrl,
            vehicleType: command.vehicleType,
            deliveryRadiusKm: command.deliveryRadiusKm,
        });

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierProfileUpdatedEvent(profile.id.value, userId.value),
        ]);
    }
}
