import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressNotFoundError } from '../../../domain/errors/customer-address-not-found.error';
import { CustomerAddressDoesNotBelongToCustomerError } from '../../../domain/errors/customer-address-does-not-belong-to-customer.error';
import { CustomerDefaultAddressChangedEvent } from '../../../domain/events/customer-default-address-changed.event';
import {
    CUSTOMER_PROFILE_REPOSITORY,
    type CustomerProfileRepository,
} from '../../ports/customer-profile.repository.port';
import {
    CUSTOMER_ADDRESS_REPOSITORY,
    type CustomerAddressRepository,
} from '../../ports/customer-address.repository.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { SetDefaultCustomerAddressCommand } from './set-default-customer-address.command';

@Injectable()
export class SetDefaultCustomerAddressUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
        @Inject(CUSTOMER_ADDRESS_REPOSITORY)
        private readonly addressRepository: CustomerAddressRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: SetDefaultCustomerAddressCommand): Promise<void> {
        const userId = UUID.create(command.userId);
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            throw new CustomerProfileNotFoundError();
        }

        const addressId = UUID.create(command.addressId);
        const address = await this.addressRepository.findById(addressId);

        if (!address) {
            throw new CustomerAddressNotFoundError();
        }

        if (!address.isOwnedBy(profile.id)) {
            throw new CustomerAddressDoesNotBelongToCustomerError();
        }

        await this.addressRepository.setDefaultAddress(profile.id, addressId);

        await this.eventPublisher.publishAll([
            new CustomerDefaultAddressChangedEvent(profile.id.value, addressId.value),
        ]);
    }
}
