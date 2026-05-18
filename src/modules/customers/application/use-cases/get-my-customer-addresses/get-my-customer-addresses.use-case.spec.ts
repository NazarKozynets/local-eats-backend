import { GetMyCustomerAddressesUseCase } from './get-my-customer-addresses.use-case';
import { GetMyCustomerAddressesCommand } from './get-my-customer-addresses.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    buildCustomerProfile,
    buildCustomerAddress,
    TEST_USER_ID,
    TEST_PROFILE_ID,
    TEST_ADDRESS_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCustomerProfileRepository,
    createMockCustomerAddressRepository,
} from '../../../__tests__/_helpers/mocks';

describe('GetMyCustomerAddressesUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let addressRepository: ReturnType<typeof createMockCustomerAddressRepository>;
    let useCase: GetMyCustomerAddressesUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        addressRepository = createMockCustomerAddressRepository();
        useCase = new GetMyCustomerAddressesUseCase(profileRepository, addressRepository);
    });

    const command = () => GetMyCustomerAddressesCommand.create({ userId: TEST_USER_ID });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('returns empty array when customer has no addresses', async () => {
        profileRepository.findByUserId.mockResolvedValue(buildCustomerProfile());
        addressRepository.findManyByCustomerId.mockResolvedValue([]);

        const result = await useCase.execute(command());

        expect(result).toEqual([]);
    });

    it('returns mapped address data for each address', async () => {
        const profile = buildCustomerProfile();
        const address = buildCustomerAddress({ isDefault: true });
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findManyByCustomerId.mockResolvedValue([address]);

        const result = await useCase.execute(command());

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(TEST_ADDRESS_ID);
        expect(result[0].customerId).toBe(TEST_PROFILE_ID);
        expect(result[0].city).toBe('Kyiv');
        expect(result[0].street).toBe('Khreshchatyk Street');
        expect(result[0].building).toBe('1');
        expect(result[0].isDefault).toBe(true);
        expect(result[0].createdAt).toBeInstanceOf(Date);
        expect(result[0].updatedAt).toBeInstanceOf(Date);
    });

    it('returns multiple addresses preserving order', async () => {
        const profile = buildCustomerProfile();
        const firstAddress = buildCustomerAddress({
            id: UUID.create('aa000000-e29b-41d4-a716-446655440000'),
            isDefault: true,
        });
        const secondAddress = buildCustomerAddress({
            id: UUID.create('bb000000-e29b-41d4-a716-446655440000'),
            isDefault: false,
        });
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findManyByCustomerId.mockResolvedValue([firstAddress, secondAddress]);

        const result = await useCase.execute(command());

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('aa000000-e29b-41d4-a716-446655440000');
        expect(result[0].isDefault).toBe(true);
        expect(result[1].id).toBe('bb000000-e29b-41d4-a716-446655440000');
        expect(result[1].isDefault).toBe(false);
    });

    it('queries addresses by profile id, not user id', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);
        addressRepository.findManyByCustomerId.mockResolvedValue([]);

        await useCase.execute(command());

        expect(addressRepository.findManyByCustomerId).toHaveBeenCalledWith(profile.id);
    });
});
