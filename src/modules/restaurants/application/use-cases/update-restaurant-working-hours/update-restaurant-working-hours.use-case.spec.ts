import { UpdateRestaurantWorkingHoursUseCase } from './update-restaurant-working-hours.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { InvalidRestaurantWorkingHoursError } from '../../../domain/errors/invalid-restaurant-working-hours.error';
import { RestaurantWorkingHoursUpdatedEvent } from '../../../domain/events/restaurant-working-hours-updated.event';
import {
    buildRestaurant,
    buildStaff,
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockRestaurantStaffRepository,
    createMockRestaurantWorkingHourRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateRestaurantWorkingHoursUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let workingHourRepository: ReturnType<typeof createMockRestaurantWorkingHourRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateRestaurantWorkingHoursUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        workingHourRepository = createMockRestaurantWorkingHourRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateRestaurantWorkingHoursUseCase(
            restaurantRepository,
            staffRepository,
            workingHourRepository,
            eventPublisher,
        );
        workingHourRepository.replaceForRestaurant.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const validHours = [{ dayOfWeek: 1, opensAt: '09:00', closesAt: '22:00', isClosed: false }];

    const command = (overrides = {}) => ({
        restaurantId: TEST_RESTAURANT_ID,
        currentUserId: TEST_USER_ID,
        hours: validHours,
        ...overrides,
    });

    it('throws RestaurantAccessDeniedError when caller is not staff', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantAccessDeniedError);
    });

    it('throws RestaurantNotFoundError when restaurant does not exist', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotFoundError);
    });

    it('throws InvalidRestaurantWorkingHoursError for invalid time format', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        const badHours = [{ dayOfWeek: 1, opensAt: '25:00', closesAt: '22:00', isClosed: false }];
        await expect(useCase.execute(command({ hours: badHours }))).rejects.toBeInstanceOf(
            InvalidRestaurantWorkingHoursError,
        );
    });

    it('throws InvalidRestaurantWorkingHoursError when opensAt >= closesAt', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        const badHours = [{ dayOfWeek: 1, opensAt: '22:00', closesAt: '09:00', isClosed: false }];
        await expect(useCase.execute(command({ hours: badHours }))).rejects.toBeInstanceOf(
            InvalidRestaurantWorkingHoursError,
        );
    });

    it('replaces working hours for restaurant on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        await useCase.execute(command());

        expect(workingHourRepository.replaceForRestaurant).toHaveBeenCalledTimes(1);
    });

    it('publishes RestaurantWorkingHoursUpdatedEvent on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantWorkingHoursUpdatedEvent)]),
        );
    });

    it('allows isClosed entries with no times', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        const closedHours = [{ dayOfWeek: 7, opensAt: null, closesAt: null, isClosed: true }];
        await expect(useCase.execute(command({ hours: closedHours }))).resolves.toBeUndefined();
    });
});
