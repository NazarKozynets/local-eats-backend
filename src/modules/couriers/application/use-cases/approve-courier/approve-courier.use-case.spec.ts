import { ApproveCourierUseCase } from './approve-courier.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierVerificationTransitionError } from '../../../domain/errors/invalid-courier-verification-transition.error';
import { CourierApprovedEvent } from '../../../domain/events/courier-approved.event';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import {
    buildCourierProfile,
    TEST_COURIER_PROFILE_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('ApproveCourierUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ApproveCourierUseCase;

    const command = () => ({
        actorUserId: TEST_ADMIN_USER_ID,
        courierProfileId: TEST_COURIER_PROFILE_ID,
    });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ApproveCourierUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierVerificationTransitionError when not PENDING', async () => {
        repository.findById.mockResolvedValue(
            buildCourierProfile({ verificationStatus: CourierVerificationStatus.UNVERIFIED }),
        );
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidCourierVerificationTransitionError);
    });

    it('sets verificationStatus to VERIFIED and profileStatus to ACTIVE', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verificationStatus).toBe(CourierVerificationStatus.VERIFIED);
        expect(profile.profileStatus).toBe(CourierProfileStatus.ACTIVE);
    });

    it('sets verifiedAt', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verifiedAt).toBeInstanceOf(Date);
    });

    it('clears verificationRejectedReason', async () => {
        const profile = buildCourierProfile({
            verificationStatus: CourierVerificationStatus.PENDING,
            verificationRejectedReason: 'Previous rejection',
        });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verificationRejectedReason).toBeNull();
    });

    it('publishes CourierApprovedEvent on success', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierApprovedEvent)]),
        );
    });
});
