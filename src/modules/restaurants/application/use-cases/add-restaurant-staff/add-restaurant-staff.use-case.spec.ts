import { AddRestaurantStaffUseCase } from './add-restaurant-staff.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantStaffAlreadyExistsError } from '../../../domain/errors/restaurant-staff-already-exists.error';
import { RestaurantAccountNotFoundError } from '../../../domain/errors/restaurant-account-not-found.error';
import { RestaurantStaffAddedEvent } from '../../../domain/events/restaurant-staff-added.event';
import { RestaurantStaffRole } from '../../../domain/enums/restaurant-staff-role.enum';
import {
    buildRestaurant,
    buildStaff,
    buildAccountSnapshot,
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    TEST_TARGET_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockRestaurantStaffRepository,
    createMockEventPublisher,
    createMockAccountAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('AddRestaurantStaffUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let accountAccessReader: ReturnType<typeof createMockAccountAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: AddRestaurantStaffUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        accountAccessReader = createMockAccountAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new AddRestaurantStaffUseCase(
            restaurantRepository,
            staffRepository,
            accountAccessReader,
            eventPublisher,
        );
        staffRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides = {}) => ({
        restaurantId: TEST_RESTAURANT_ID,
        currentUserId: TEST_USER_ID,
        targetUserId: TEST_TARGET_USER_ID,
        role: RestaurantStaffRole.MANAGER,
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

    it('throws RestaurantAccountNotFoundError when target user does not exist', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        accountAccessReader.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantAccountNotFoundError);
    });

    it('throws RestaurantStaffAlreadyExistsError when user is already staff', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot({ id: TEST_TARGET_USER_ID }));
        staffRepository.exists.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantStaffAlreadyExistsError);
    });

    it('saves new staff member with correct role on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot({ id: TEST_TARGET_USER_ID }));
        staffRepository.exists.mockResolvedValue(false);

        await useCase.execute(command({ role: RestaurantStaffRole.MANAGER }));

        expect(staffRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({ role: RestaurantStaffRole.MANAGER }),
        );
    });

    it('publishes RestaurantStaffAddedEvent on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot({ id: TEST_TARGET_USER_ID }));
        staffRepository.exists.mockResolvedValue(false);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantStaffAddedEvent)]),
        );
    });
});
