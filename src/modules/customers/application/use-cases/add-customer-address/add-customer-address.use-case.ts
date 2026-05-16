import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CustomerAddress } from '../../../domain/entities/customer-address.entity';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressAddedEvent } from '../../../domain/events/customer-address-added.event';
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
import type { AddCustomerAddressCommand } from './add-customer-address.command';
import type { DomainEvent } from '../../../../../shared/domain/events/domain-event.base';

@Injectable()
export class AddCustomerAddressUseCase {
    constructor(
        @Inject(CUSTOMER_PROFILE_REPOSITORY)
        private readonly profileRepository: CustomerProfileRepository,
        @Inject(CUSTOMER_ADDRESS_REPOSITORY)
        private readonly addressRepository: CustomerAddressRepository,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: AddCustomerAddressCommand): Promise<void> {
        const userId = UUID.create(command.userId);
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            throw new CustomerProfileNotFoundError();
        }

        const existingCount = await this.addressRepository.countByCustomerId(profile.id);
        const isFirstAddress = existingCount === 0;
        const shouldBeDefault = isFirstAddress || command.isDefault;

        const address = CustomerAddress.create({
            id: UUID.generate(),
            customerId: profile.id,
            label: command.label,
            city: command.city,
            street: command.street,
            building: command.building,
            apartment: command.apartment,
            entrance: command.entrance,
            floor: command.floor,
            comment: command.comment,
            isDefault: shouldBeDefault,
        });

        await this.addressRepository.save(address);

        if (shouldBeDefault && !isFirstAddress) {
            await this.addressRepository.setDefaultAddress(profile.id, address.id);
        }

        const events: DomainEvent[] = [
            new CustomerAddressAddedEvent(address.id.value, profile.id.value),
        ];

        if (shouldBeDefault) {
            events.push(new CustomerDefaultAddressChangedEvent(profile.id.value, address.id.value));
        }

        await this.eventPublisher.publishAll(events);
    }
}
