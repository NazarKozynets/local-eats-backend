import { GetMyCustomerProfileUseCase } from './get-my-customer-profile.use-case';
import { GetMyCustomerProfileCommand } from './get-my-customer-profile.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import {
    buildCustomerProfile,
    TEST_USER_ID,
    TEST_PROFILE_ID,
} from '../../../__tests__/_helpers/builders';
import { createMockCustomerProfileRepository } from '../../../__tests__/_helpers/mocks';

describe('GetMyCustomerProfileUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let useCase: GetMyCustomerProfileUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        useCase = new GetMyCustomerProfileUseCase(profileRepository);
    });

    const command = () => GetMyCustomerProfileCommand.create({ userId: TEST_USER_ID });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('returns profile data when found', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);

        const result = await useCase.execute(command());

        expect(result.id).toBe(TEST_PROFILE_ID);
        expect(result.userId).toBe(TEST_USER_ID);
        expect(result.displayName).toBe('Test User');
        expect(result.avatarUrl).toBeNull();
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('returns null displayName when profile has no display name', async () => {
        const profile = buildCustomerProfile({ displayName: null });
        profileRepository.findByUserId.mockResolvedValue(profile);

        const result = await useCase.execute(command());

        expect(result.displayName).toBeNull();
    });

    it('returns avatarUrl when set on profile', async () => {
        const profile = buildCustomerProfile({ avatarUrl: 'https://example.com/avatar.jpg' });
        profileRepository.findByUserId.mockResolvedValue(profile);

        const result = await useCase.execute(command());

        expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
});
