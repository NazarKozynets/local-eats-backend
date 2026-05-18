import { UpdateCustomerAddressUseCase } from './update-customer-address.use-case';
import { UpdateCustomerAddressCommand } from './update-customer-address.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerAddressNotFoundError } from '../../../domain/errors/customer-address-not-found.error';
import { CustomerAddressDoesNotBelongToCustomerError } from '../../../domain/errors/customer-address-does-not-belong-to-customer.error';
import { CustomerAddressUpdatedEvent } from '../../../domain/events/customer-address-updated.event';
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

describe('UpdateCustomerAddressUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let addressRepository: ReturnType<typeof createMockCustomerAddressRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateCustomerAddressUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        addressRepository = createMockCustomerAddressRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateCustomerAddressUseCase(
            profileRepository,
            addressRepository,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        addressRepository.save.mockResolvedValue(undefined);
    });

    const baseCommand = (overrides: Partial<Parameters<typeof UpdateCustomerAddressCommand.create>[0]> = {}) =>
        UpdateCustomerAddressCommand.create({
            userId: TEST_USER_ID,
            addressId: TEST_ADDRESS_ID,
            ...overrides,
        });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('throws CustomerAddressNotFoundError when address does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(CustomerAddressNotFoundError);
    });

    it('throws CustomerAddressDoesNotBelongToCustomerError when address belongs to another profile', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        const otherAddress = buildCustomerAddress({
            customerId: UUID.create('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        });
        addressRepository.findById.mockResolvedValue(otherAddress);

        await expect(useCase.execute(baseCommand())).rejects.toBeInstanceOf(
            CustomerAddressDoesNotBelongToCustomerError,
        );
    });

    it('updates city when provided', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        await useCase.execute(baseCommand({ city: 'Lviv' }));

        expect(address.city).toBe('Lviv');
        expect(addressRepository.save).toHaveBeenCalledWith(address);
    });

    it('updates street and building when provided', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        await useCase.execute(baseCommand({ street: 'New Street', building: '42' }));

        expect(address.street).toBe('New Street');
        expect(address.building).toBe('42');
    });

    it('clears optional fields when null is passed', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress({ label: 'Home', comment: 'Ring bell' });
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        await useCase.execute(baseCommand({ label: null, comment: null }));

        expect(address.label).toBeNull();
        expect(address.comment).toBeNull();
    });

    it('publishes CustomerAddressUpdatedEvent on success', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        await useCase.execute(baseCommand({ city: 'Odesa' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CustomerAddressUpdatedEvent)]),
        );
    });

    it('saves address before publishing event', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findById.mockResolvedValue(address);

        const callOrder: string[] = [];
        addressRepository.save.mockImplementation(async () => { callOrder.push('save'); });
        eventPublisher.publishAll.mockImplementation(async () => { callOrder.push('publish'); });

        await useCase.execute(baseCommand({ city: 'Odesa' }));

        expect(callOrder).toEqual(['save', 'publish']);
    });
});
