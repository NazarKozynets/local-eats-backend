import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import {
    COURIER_PROFILE_REPOSITORY,
    type CourierProfileRepository,
} from '../../ports/courier-profile.repository.port';
import type { CourierProfileResult } from './get-my-courier-profile.result';

@Injectable()
export class GetMyCourierProfileUseCase {
    constructor(
        @Inject(COURIER_PROFILE_REPOSITORY)
        private readonly courierProfileRepository: CourierProfileRepository,
    ) {}

    async execute(command: { currentUserId: string }): Promise<CourierProfileResult> {
        const userId = UUID.create(command.currentUserId);
        const profile = await this.courierProfileRepository.findByUserId(userId);

        if (!profile) {
            throw new CourierProfileNotFoundError();
        }

        return {
            id: profile.id.value,
            userId: profile.userId.value,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            verificationStatus: profile.verificationStatus,
            verificationRejectedReason: profile.verificationRejectedReason,
            verifiedAt: profile.verifiedAt,
            profileStatus: profile.profileStatus,
            availabilityStatus: profile.availabilityStatus,
            vehicleType: profile.vehicleType,
            deliveryRadiusKm: profile.deliveryRadiusKm,
            completedDeliveriesCount: profile.completedDeliveriesCount,
            ratingAvg: profile.ratingAvg,
            ratingCount: profile.ratingCount,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
