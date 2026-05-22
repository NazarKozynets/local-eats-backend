import { GetMyCourierProfileUseCase } from './get-my-courier-profile.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import {
    buildCourierProfile,
    TEST_USER_ID,
    TEST_COURIER_PROFILE_ID,
} from '../../../__tests__/_helpers/builders';
import { createMockCourierProfileRepository } from '../../../__tests__/_helpers/mocks';

describe('GetMyCourierProfileUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let useCase: GetMyCourierProfileUseCase;

    const command = () => ({ currentUserId: TEST_USER_ID });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        useCase = new GetMyCourierProfileUseCase(repository);
    });

    it('returns the courier profile for the current user', async () => {
        const profile = buildCourierProfile();
        repository.findByUserId.mockResolvedValue(profile);

        const result = await useCase.execute(command());

        expect(result.id).toBe(TEST_COURIER_PROFILE_ID);
        expect(result.userId).toBe(TEST_USER_ID);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('maps all profile fields into the result', async () => {
        const profile = buildCourierProfile({ displayName: 'Alex' });
        repository.findByUserId.mockResolvedValue(profile);

        const result = await useCase.execute(command());

        expect(result.displayName).toBe('Alex');
        expect(result.verificationStatus).toBeDefined();
        expect(result.profileStatus).toBeDefined();
        expect(result.availabilityStatus).toBeDefined();
    });
});
