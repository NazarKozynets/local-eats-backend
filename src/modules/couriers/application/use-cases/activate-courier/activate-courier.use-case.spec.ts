import { ActivateCourierUseCase } from './activate-courier.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierProfileStatusTransitionError } from '../../../domain/errors/invalid-courier-profile-status-transition.error';
import { CourierActivatedEvent } from '../../../domain/events/courier-activated.event';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import {
    buildVerifiedActiveCourier,
    buildCourierProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('ActivateCourierUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ActivateCourierUseCase;

    const command = () => ({ currentUserId: TEST_USER_ID });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ActivateCourierUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('activates a verified PAUSED courier', async () => {
        const profile = buildCourierProfile({
            verificationStatus: CourierVerificationStatus.VERIFIED,
            profileStatus: CourierProfileStatus.PAUSED,
        });
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.profileStatus).toBe(CourierProfileStatus.ACTIVE);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierProfileStatusTransitionError when ACTIVE (not PAUSED)', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCourierProfileStatusTransitionError,
        );
    });

    it('throws InvalidCourierProfileStatusTransitionError when BLOCKED', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.BLOCKED });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCourierProfileStatusTransitionError,
        );
    });

    it('throws InvalidCourierProfileStatusTransitionError when not VERIFIED', async () => {
        const profile = buildCourierProfile({
            verificationStatus: CourierVerificationStatus.PENDING,
            profileStatus: CourierProfileStatus.PAUSED,
        });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCourierProfileStatusTransitionError,
        );
    });

    it('publishes CourierActivatedEvent on success', async () => {
        const profile = buildCourierProfile({
            verificationStatus: CourierVerificationStatus.VERIFIED,
            profileStatus: CourierProfileStatus.PAUSED,
        });
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierActivatedEvent)]),
        );
    });
});
