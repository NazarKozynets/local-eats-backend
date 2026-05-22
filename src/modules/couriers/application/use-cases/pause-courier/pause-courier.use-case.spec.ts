import { PauseCourierUseCase } from './pause-courier.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierProfileStatusTransitionError } from '../../../domain/errors/invalid-courier-profile-status-transition.error';
import { CourierPausedEvent } from '../../../domain/events/courier-paused.event';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import {
    buildVerifiedActiveCourier,
    buildCourierProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('PauseCourierUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: PauseCourierUseCase;

    const command = () => ({ currentUserId: TEST_USER_ID });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new PauseCourierUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('pauses an ACTIVE courier', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.profileStatus).toBe(CourierProfileStatus.PAUSED);
    });

    it('sets availability to OFFLINE when pausing', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.availabilityStatus).toBe(CourierAvailabilityStatus.OFFLINE);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierProfileStatusTransitionError when not ACTIVE', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.INCOMPLETE });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(InvalidCourierProfileStatusTransitionError);
    });

    it('publishes CourierPausedEvent on success', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierPausedEvent)]),
        );
    });
});
