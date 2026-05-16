import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import {
    CUSTOMER_PROFILE_REPOSITORY,
    type CustomerProfileRepository,
} from '../../ports/customer-profile.repository.port';
import {
    CUSTOMER_ADDRESS_REPOSITORY,
    type CustomerAddressRepository,
} from '../../ports/customer-address.repository.port';
import type { GetMyCustomerAddressesCommand } from './get-my-customer-addresses.command';
import type { GetMyCustomerAddressesResult } from './get-my-customer-addresses.result';

@Injectable()
export class GetMyCustomerAddressesUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
        @Inject(CUSTOMER_ADDRESS_REPOSITORY)
        private readonly addressRepository: CustomerAddressRepository,
    ) {}

    async execute(command: GetMyCustomerAddressesCommand): Promise<GetMyCustomerAddressesResult> {
        const userId = UUID.create(command.userId);
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            throw new CustomerProfileNotFoundError();
        }

        const addresses = await this.addressRepository.findManyByCustomerId(profile.id);

        return addresses.map((address) => ({
            id: address.id.value,
            customerId: address.customerId.value,
            label: address.label,
            city: address.city,
            street: address.street,
            building: address.building,
            apartment: address.apartment,
            entrance: address.entrance,
            floor: address.floor,
            comment: address.comment,
            isDefault: address.isDefault,
            createdAt: address.createdAt,
            updatedAt: address.updatedAt,
        }));
    }
}
