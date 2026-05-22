import { SetCourierAvailabilityUseCase } from './set-courier-availability.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierAvailabilityTransitionError } from '../../../domain/errors/invalid-courier-availability-transition.error';
import { CourierAvailabilityChangedEvent } from '../../../domain/events/courier-availability-changed.event';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import {
    buildVerifiedActiveCourier,
    buildCourierProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('SetCourierAvailabilityUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: SetCourierAvailabilityUseCase;

    const command = (availabilityStatus = CourierAvailabilityStatus.ONLINE) => ({
        currentUserId: TEST_USER_ID,
        availabilityStatus,
    });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new SetCourierAvailabilityUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('sets availability to ONLINE for a verified ACTIVE courier', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command(CourierAvailabilityStatus.ONLINE));

        expect(profile.availabilityStatus).toBe(CourierAvailabilityStatus.ONLINE);
    });

    it('sets availability to BUSY for a verified ACTIVE courier', async () => {
        const profile = buildVerifiedActiveCourier({ availabilityStatus: CourierAvailabilityStatus.ONLINE });
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command(CourierAvailabilityStatus.BUSY));

        expect(profile.availabilityStatus).toBe(CourierAvailabilityStatus.BUSY);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierAvailabilityTransitionError when profile is PAUSED', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.PAUSED });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCourierAvailabilityTransitionError,
        );
    });

    it('throws InvalidCourierAvailabilityTransitionError when profile is BLOCKED', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.BLOCKED });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCourierAvailabilityTransitionError,
        );
    });

    it('publishes CourierAvailabilityChangedEvent on success', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command(CourierAvailabilityStatus.ONLINE));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierAvailabilityChangedEvent)]),
        );
    });
});
