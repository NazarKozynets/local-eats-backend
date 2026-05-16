import { SetDefaultCustomerAddressUseCase } from './set-default-customer-address.use-case';
import { SetDefaultCustomerAddressCommand } from './set-default-customer-address.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressNotFoundError } from '../../../domain/errors/customer-address-not-found.error';
import { CustomerAddressDoesNotBelongToCustomerError } from '../../../domain/errors/customer-address-does-not-belong-to-customer.error';
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

describe('SetDefaultCustomerAddressUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let addressRepository: ReturnType<typeof createMockCustomerAddressRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: SetDefaultCustomerAddressUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        addressRepository = createMockCustomerAddressRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new SetDefaultCustomerAddressUseCase(
            profileRepository,
            addressRepository,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        addressRepository.setDefaultAddress.mockResolvedValue(undefined);
    });

    const command = () =>
        SetDefaultCustomerAddressCommand.create({
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

    it('throws CustomerAddressDoesNotBelongToCustomerError when address belongs to another profile', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        const otherAddress = buildCustomerAddress({
            customerId: UUID.create('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        });
        addressRepository.findById.mockResolvedValue(otherAddress);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            CustomerAddressDoesNotBelongToCustomerError,
        );
    });

    it('calls setDefaultAddress and publishes event on success', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        await useCase.execute(command());

        expect(addressRepository.setDefaultAddress).toHaveBeenCalledTimes(1);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CustomerDefaultAddressChangedEvent)]),
        );
    });
});
