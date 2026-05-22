import { UpdateCourierLocationUseCase } from './update-courier-location.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierLocationError } from '../../../domain/errors/invalid-courier-location.error';
import { CourierLocationUpdatedEvent } from '../../../domain/events/courier-location-updated.event';
import {
    buildVerifiedActiveCourier,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateCourierLocationUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateCourierLocationUseCase;

    const command = (latitude = 48.8566, longitude = 2.3522) => ({
        currentUserId: TEST_USER_ID,
        latitude,
        longitude,
    });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateCourierLocationUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('updates location for a valid courier', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command(48.8566, 2.3522));

        expect(profile.currentLocation).toEqual({ latitude: 48.8566, longitude: 2.3522 });
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierLocationError for latitude out of range', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command(91, 0))).rejects.toBeInstanceOf(
            InvalidCourierLocationError,
        );
    });

    it('throws InvalidCourierLocationError for longitude out of range', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await expect(useCase.execute(command(0, 181))).rejects.toBeInstanceOf(
            InvalidCourierLocationError,
        );
    });

    it('publishes CourierLocationUpdatedEvent on success', async () => {
        const profile = buildVerifiedActiveCourier();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command(48.8566, 2.3522));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierLocationUpdatedEvent)]),
        );
    });
});
