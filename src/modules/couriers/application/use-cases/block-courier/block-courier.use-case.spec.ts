import { BlockCourierUseCase } from './block-courier.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { CourierBlockedEvent } from '../../../domain/events/courier-blocked.event';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import {
    buildVerifiedActiveCourier,
    buildCourierProfile,
    TEST_COURIER_PROFILE_ID,
    TEST_ADMIN_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('BlockCourierUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: BlockCourierUseCase;

    const command = () => ({
        actorUserId: TEST_ADMIN_USER_ID,
        courierProfileId: TEST_COURIER_PROFILE_ID,
    });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new BlockCourierUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('blocks an ACTIVE courier', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.profileStatus).toBe(CourierProfileStatus.BLOCKED);
    });

    it('sets availability to OFFLINE when blocking', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.availabilityStatus).toBe(CourierAvailabilityStatus.OFFLINE);
    });

    it('blocks a PAUSED courier', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.PAUSED });
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(profile.profileStatus).toBe(CourierProfileStatus.BLOCKED);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('publishes CourierBlockedEvent on success', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findById.mockResolvedValue(profile);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierBlockedEvent)]),
        );
    });
});
