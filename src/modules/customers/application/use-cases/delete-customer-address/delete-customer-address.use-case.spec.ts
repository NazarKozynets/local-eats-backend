import { DeleteCustomerAddressUseCase } from './delete-customer-address.use-case';
import { DeleteCustomerAddressCommand } from './delete-customer-address.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressNotFoundError } from '../../../domain/errors/customer-address-not-found.error';
import { CustomerAddressDoesNotBelongToCustomerError } from '../../../domain/errors/customer-address-does-not-belong-to-customer.error';
import { CustomerAddressDeletedEvent } from '../../../domain/events/customer-address-deleted.event';
import { CustomerDefaultAddressChangedEvent } from '../../../domain/events/customer-default-address-changed.event';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    buildCustomerProfile,
    buildCustomerAddress,
    TEST_USER_ID,
    TEST_ADDRESS_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCustomerProfileRepository,
    createMockCustomerAddressRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('DeleteCustomerAddressUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let addressRepository: ReturnType<typeof createMockCustomerAddressRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: DeleteCustomerAddressUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        addressRepository = createMockCustomerAddressRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new DeleteCustomerAddressUseCase(
            profileRepository,
            addressRepository,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        addressRepository.delete.mockResolvedValue(undefined);
        addressRepository.setDefaultAddress.mockResolvedValue(undefined);
    });

    const command = () =>
        DeleteCustomerAddressCommand.create({
            userId: TEST_USER_ID,
            addressId: TEST_ADDRESS_ID,
        });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('throws CustomerAddressNotFoundError when address does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerAddressNotFoundError);
    });

    it('throws CustomerAddressDoesNotBelongToCustomerError for another profile address', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findById.mockResolvedValue(
            buildCustomerAddress({ customerId: UUID.create('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            CustomerAddressDoesNotBelongToCustomerError,
        );
    });

    it('deletes a non-default address without reassigning default', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findById.mockResolvedValue(buildCustomerAddress({ isDefault: false }));

        await useCase.execute(command());

        expect(addressRepository.delete).toHaveBeenCalledTimes(1);
        expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
        expect(addressRepository.findOldestByCustomerId).not.toHaveBeenCalled();
    });

    it('promotes the oldest address when deleting the default one', async () => {
        const profile = buildCustomerProfile();
        const nextAddress = buildCustomerAddress({
            id: UUID.create('880e8400-e29b-41d4-a716-446655440003'),
        });
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(buildCustomerAddress({ isDefault: true }));
        addressRepository.findOldestByCustomerId.mockResolvedValue(nextAddress);

        await useCase.execute(command());

        expect(addressRepository.setDefaultAddress).toHaveBeenCalledTimes(1);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.any(CustomerAddressDeletedEvent),
                expect.any(CustomerDefaultAddressChangedEvent),
            ]),
        );
    });

    it('publishes only CustomerAddressDeletedEvent for non-default address', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findById.mockResolvedValue(buildCustomerAddress({ isDefault: false }));

        await useCase.execute(command());

        const publishedEvents = eventPublisher.publishAll.mock.calls[0][0];
        expect(publishedEvents).toHaveLength(1);
        expect(publishedEvents[0]).toBeInstanceOf(CustomerAddressDeletedEvent);
    });
});
