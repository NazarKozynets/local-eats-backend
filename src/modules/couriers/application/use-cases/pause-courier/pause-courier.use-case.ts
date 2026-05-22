import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierPausedEvent } from '../../../domain/events/courier-paused.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { PauseCourierCommand } from './pause-courier.command';

@Injectable()
export class PauseCourierUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: PauseCourierCommand): Promise<void> {
        const userId = UUID.create(command.currentUserId);
        const profile = await this.courierProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        profile.pause();

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierPausedEvent(profile.id.value, userId.value),
        ]);
    }
}
