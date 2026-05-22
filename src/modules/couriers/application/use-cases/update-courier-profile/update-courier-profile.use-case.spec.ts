import { UpdateCourierProfileUseCase } from './update-courier-profile.use-case';
import { CourierProfileNotFoundError } from '../../../domain/errors/courier-profile-not-found.error';
import { InvalidCourierProfileStatusTransitionError } from '../../../domain/errors/invalid-courier-profile-status-transition.error';
import { InvalidCourierDeliveryRadiusError } from '../../../domain/errors/invalid-courier-delivery-radius.error';
import { CourierProfileUpdatedEvent } from '../../../domain/events/courier-profile-updated.event';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';
import {
    buildCourierProfile,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateCourierProfileUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateCourierProfileUseCase;

    const command = (overrides = {}) => ({ currentUserId: TEST_USER_ID, ...overrides });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateCourierProfileUseCase(repository, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    it('updates display name and vehicle type', async () => {
        const profile = buildCourierProfile();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command({ displayName: 'New Name', vehicleType: CourierVehicleType.CAR }));

        expect(profile.displayName).toBe('New Name');
        expect(profile.vehicleType).toBe(CourierVehicleType.CAR);
        expect(repository.save).toHaveBeenCalledWith(profile);
    });

    it('throws CourierProfileNotFoundError when profile does not exist', async () => {
        repository.findByUserId.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileNotFoundError);
    });

    it('throws InvalidCourierProfileStatusTransitionError when courier is BLOCKED', async () => {
        const profile = buildCourierProfile({ profileStatus: CourierProfileStatus.BLOCKED });
        repository.findByUserId.mockResolvedValue(profile);

        await expect(
            useCase.execute(command({ displayName: 'New Name' })),
        ).rejects.toBeInstanceOf(InvalidCourierProfileStatusTransitionError);
    });

    it('throws InvalidCourierDeliveryRadiusError for invalid delivery radius', async () => {
        const profile = buildCourierProfile();
        repository.findByUserId.mockResolvedValue(profile);

        await expect(
            useCase.execute(command({ deliveryRadiusKm: 0 })),
        ).rejects.toBeInstanceOf(InvalidCourierDeliveryRadiusError);
    });

    it('publishes CourierProfileUpdatedEvent on success', async () => {
        const profile = buildCourierProfile();
        repository.findByUserId.mockResolvedValue(profile);

        await useCase.execute(command({ displayName: 'Updated' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierProfileUpdatedEvent)]),
        );
    });
});
