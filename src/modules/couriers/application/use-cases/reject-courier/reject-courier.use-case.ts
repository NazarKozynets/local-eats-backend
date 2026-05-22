import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierRejectedEvent } from '../../../domain/events/courier-rejected.event';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { RejectCourierCommand } from './reject-courier.command';

@Injectable()
export class RejectCourierUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: RejectCourierCommand): Promise<void> {
        const profileId = UUID.create(command.courierProfileId);
        const profile = await this.courierProfileRepository.findById(profileId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        profile.reject(command.reason);

        await this.courierProfileRepository.save(profile);
        await this.eventPublisher.publishAll([
            new CourierRejectedEvent(
                profile.id.value,
                profile.userId.value,
                command.actorUserId,
                command.reason,
            ),
        ]);
    }
}
