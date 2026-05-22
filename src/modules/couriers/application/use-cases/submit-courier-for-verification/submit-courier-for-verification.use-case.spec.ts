import { SubmitCourierForVerificationUseCase } from './submit-courier-for-verification.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierVerificationTransitionError } from '../../../domain/errors/invalid-courier-verification-transition.error';
import { CourierSubmittedForVerificationEvent } from '../../../domain/events/courier-submitted-for-verification.event';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import {
    buildCourierProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('SubmitCourierForVerificationUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: SubmitCourierForVerificationUseCase;

    const command = () => ({ currentUserId: TEST_USER_ID });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new SubmitCourierForVerificationUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('submits UNVERIFIED profile for verification', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.UNVERIFIED });
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verificationStatus).toBe(CourierVerificationStatus.PENDING);
        expect(repository.save).toHaveBeenCalledWith(profile);
    });

    it('allows re-submission from REJECTED status', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.REJECTED });
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.verificationStatus).toBe(CourierVerificationStatus.PENDING);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierVerificationTransitionError from PENDING status', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.PENDING });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidCourierVerificationTransitionError);
    });

    it('throws InvalidCourierVerificationTransitionError from VERIFIED status', async () => {
        const profile = buildCourierProfile({ verificationStatus: CourierVerificationStatus.VERIFIED });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidCourierVerificationTransitionError);
    });

    it('publishes CourierSubmittedForVerificationEvent on success', async () => {
        const profile = buildCourierProfile();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierSubmittedForVerificationEvent)]),
        );
    });
});
