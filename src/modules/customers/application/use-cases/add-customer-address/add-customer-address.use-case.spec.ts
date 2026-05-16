import { AddCustomerAddressUseCase } from './add-customer-address.use-case';
import { AddCustomerAddressCommand } from './add-customer-address.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressAddedEvent } from '../../../domain/events/customer-address-added.event';
import { CustomerDefaultAddressChangedEvent } from '../../../domain/events/customer-default-address-changed.event';
import {
    buildCustomerProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCustomerProfileRepository,
    createMockCustomerAddressRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('AddCustomerAddressUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let addressRepository: ReturnType<typeof createMockCustomerAddressRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: AddCustomerAddressUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        addressRepository = createMockCustomerAddressRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new AddCustomerAddressUseCase(
            profileRepository,
            addressRepository,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        addressRepository.save.mockResolvedValue(undefined);
        addressRepository.setDefaultAddress.mockResolvedValue(undefined);
    });

    const baseCommand = (overrides: Partial<Parameters<typeof AddCustomerAddressCommand.create>[0]> = {}) =>
        AddCustomerAddressCommand.create({
            userId: TEST_USER_ID,
            city: 'Kyiv',
            street: 'Main St',
            building: '1',
            ...overrides,
        });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('sets isDefault=true when this is the first address', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.countByCustomerId.mockResolvedValue(0);

        await useCase.execute(baseCommand({ isDefault: false }));

        const savedAddress = addressRepository.save.mock.calls[0][0];
        expect(savedAddress.isDefault).toBe(true);
        expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
    });

    it('calls setDefaultAddress when adding a default address to a non-empty list', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.countByCustomerId.mockResolvedValue(2);

        await useCase.execute(baseCommand({ isDefault: true }));

        expect(addressRepository.save).toHaveBeenCalledTimes(1);
        expect(addressRepository.setDefaultAddress).toHaveBeenCalledTimes(1);
    });

    it('does not call setDefaultAddress when adding a non-default address', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.countByCustomerId.mockResolvedValue(2);

        await useCase.execute(baseCommand({ isDefault: false }));

        expect(addressRepository.setDefaultAddress).not.toHaveBeenCalled();
    });

    it('publishes CustomerAddressAddedEvent on success', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.countByCustomerId.mockResolvedValue(1);

        await useCase.execute(baseCommand());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CustomerAddressAddedEvent)]),
        );
    });

    it('publishes CustomerDefaultAddressChangedEvent when shouldBeDefault is true', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.countByCustomerId.mockResolvedValue(0);

        await useCase.execute(baseCommand());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.any(CustomerAddressAddedEvent),
                expect.any(CustomerDefaultAddressChangedEvent),
            ]),
        );
    });
});
