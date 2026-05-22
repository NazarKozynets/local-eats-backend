import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierBlockedEvent } from '../../../domain/events/courier-blocked.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { BlockCourierCommand } from './block-courier.command';

@Injectable()
export class BlockCourierUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: BlockCourierCommand): Promise<void> {
        const profileId = UUID.create(command.courierProfileId);
        const profile = await this.courierProfileRepository.findById(profileId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        profile.block();

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierBlockedEvent(profile.id.value, profile.userId.value, command.actorUserId),
        ]);
    }
}
