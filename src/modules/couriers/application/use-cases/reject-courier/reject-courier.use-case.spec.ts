import { RejectCourierUseCase } from './reject-courier.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierVerificationTransitionError } from '../../../domain/errors/invalid-courier-verification-transition.error';
import { CourierRejectedEvent } from '../../../domain/events/courier-rejected.event';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import {
    buildCourierProfile,
    TEST_COURIER_PROFILE_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('RejectCourierUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RejectCourierUseCase;

    const command = (overrides = {}) => ({
        actorUserId: TEST_ADMIN_USER_ID,
        courierProfileId: TEST_COURIER_PROFILE_ID,
        reason: 'Missing documents',
        ...overrides,
    });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new RejectCourierUseCase(repository, eventPublisher);

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

    it('sets profileStatus to REJECTED and verificationStatus to REJECTED', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verificationStatus).toBe(CourierVerificationStatus.REJECTED);
        expect(profile.profileStatus).toBe(CourierProfileStatus.REJECTED);
    });

    it('sets availabilityStatus to OFFLINE', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.availabilityStatus).toBe(CourierAvailabilityStatus.OFFLINE);
    });

    it('stores the rejection reason', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command({ reason: 'Invalid ID' }));

        expect(profile.verificationRejectedReason).toBe('Invalid ID');
    });

    it('publishes CourierRejectedEvent on success', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierRejectedEvent)]),
        );
    });
});
