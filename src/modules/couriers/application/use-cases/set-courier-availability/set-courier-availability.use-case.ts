import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierAvailabilityChangedEvent } from '../../../domain/events/courier-availability-changed.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { SetCourierAvailabilityCommand } from './set-courier-availability.command';

@Injectable()
export class SetCourierAvailabilityUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: SetCourierAvailabilityCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const profile = await this.courierProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        const previousStatus = profile.availabilityStatus;
        profile.setAvailability(command.availabilityStatus);

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierAvailabilityChangedEvent(
                profile.id.value,
                userId.value,
                previousStatus,
                command.availabilityStatus,
            ),
        ]);
    }
}
