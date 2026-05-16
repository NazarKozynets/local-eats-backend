import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import {
    CUSTOMER_PROFILE_REPOSITORY,
    type CustomerProfileRepository,
} from '../../ports/customer-profile.repository.port';
import type { GetMyCustomerProfileCommand } from './get-my-customer-profile.command';
import type { GetMyCustomerProfileResult } from './get-my-customer-profile.result';

@Injectable()
export class GetMyCustomerProfileUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
    ) {}

    async execute(command: GetMyCustomerProfileCommand): Promise<GetMyCustomerProfileResult> {
        const userId = UUID.create(command.userId);
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            throw new CustomerProfileNotFoundError();
        }

        return {
            id: profile.id.value,
            userId: profile.userId.value,
            displayName: profile.displayName?.value ?? null,
            avatarUrl: profile.avatarUrl,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
