import { UpdateCustomerProfileUseCase } from './update-customer-profile.use-case';
import { UpdateCustomerProfileCommand } from './update-customer-profile.command';
import { CustomerProfileNotFoundError } from '../../../domain/errors/customer-profile-not-found.error';
import { CustomerProfileUpdatedEvent } from '../../../domain/events/customer-profile-updated.event';
import {
    buildCustomerProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCustomerProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateCustomerProfileUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateCustomerProfileUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateCustomerProfileUseCase(profileRepository, eventPublisher);
        eventPublisher.publishAll.mockResolvedValue(undefined);
        profileRepository.save.mockResolvedValue(undefined);
    });

    it('throws CustomerProfileNotFoundError when profile does not exist', async () => {
        profileRepository.findByUserId.mockResolvedValue(null);

        await expect(
            useCase.execute(UpdateCustomerProfileCommand.create({ userId: TEST_USER_ID })),
        ).rejects.toBeInstanceOf(CustomerProfileNotFoundError);
    });

    it('updates display name when provided', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(
            UpdateCustomerProfileCommand.create({ userId: TEST_USER_ID, displayName: 'New Name' }),
        );

        expect(profile.displayName?.value).toBe('New Name');
        expect(profileRepository.save).toHaveBeenCalledWith(profile);
    });

    it('clears display name when null is passed', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(
            UpdateCustomerProfileCommand.create({ userId: TEST_USER_ID, displayName: null }),
        );

        expect(profile.displayName).toBeNull();
    });

    it('does not modify display name when undefined is passed', async () => {
        const profile = buildCustomerProfile();
        const originalName = profile.displayName?.value;
        profileRepository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(
            UpdateCustomerProfileCommand.create({ userId: TEST_USER_ID }),
        );

        expect(profile.displayName?.value).toBe(originalName);
    });

    it('publishes CustomerProfileUpdatedEvent on success', async () => {
        const profile = buildCustomerProfile();
        profileRepository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(
            UpdateCustomerProfileCommand.create({ userId: TEST_USER_ID, avatarUrl: 'https://example.com/img.jpg' }),
        );

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CustomerProfileUpdatedEvent)]),
        );
    });
});
