import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierLocationUpdatedEvent } from '../../../domain/events/courier-location-updated.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { UpdateCourierLocationCommand } from './update-courier-location.command';

@Injectable()
export class UpdateCourierLocationUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateCourierLocationCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const profile = await this.courierProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        profile.updateLocation(command.latitude, command.longitude);

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierLocationUpdatedEvent(
                profile.id.value,
                userId.value,
                command.latitude,
                command.longitude,
            ),
        ]);
    }
}
