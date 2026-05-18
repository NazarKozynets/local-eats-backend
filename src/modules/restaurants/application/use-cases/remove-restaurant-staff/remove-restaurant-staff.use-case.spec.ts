import { RemoveRestaurantStaffUseCase } from './remove-restaurant-staff.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantStaffNotFoundError } from '../../../domain/errors/restaurant-staff-not-found.error';
import { RestaurantOwnerCannotBeRemovedError } from '../../../domain/errors/restaurant-owner-cannot-be-removed.error';
import { RestaurantStaffRemovedEvent } from '../../../domain/events/restaurant-staff-removed.event';
import { RestaurantStaffRole } from '../../../domain/enums/restaurant-staff-role.enum';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    buildRestaurant,
    buildStaff,
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
    TEST_STAFF_ID,
    TEST_TARGET_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockRestaurantStaffRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('RemoveRestaurantStaffUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RemoveRestaurantStaffUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new RemoveRestaurantStaffUseCase(restaurantRepository, staffRepository, eventPublisher);
        staffRepository.delete.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const targetStaff = () =>
        buildStaff({
            id: UUID.create(TEST_STAFF_ID),
            userId: UUID.create(TEST_TARGET_USER_ID),
            role: RestaurantStaffRole.MANAGER,
        });

    const command = (overrides = {}) => ({
        restaurantId: TEST_RESTAURANT_ID,
        currentUserId: TEST_USER_ID,
        staffId: TEST_STAFF_ID,
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

    it('throws RestaurantStaffNotFoundError when target staff does not exist', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        staffRepository.findManyByRestaurantId.mockResolvedValue([]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantStaffNotFoundError);
    });

    it('throws RestaurantOwnerCannotBeRemovedError when trying to remove an OWNER', async () => {
        const ownerStaff = buildStaff({
            id: UUID.create(TEST_STAFF_ID),
            role: RestaurantStaffRole.OWNER,
        });
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        staffRepository.findManyByRestaurantId.mockResolvedValue([ownerStaff]);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            RestaurantOwnerCannotBeRemovedError,
        );
    });

    it('deletes target MANAGER staff on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        staffRepository.findManyByRestaurantId.mockResolvedValue([targetStaff()]);

        await useCase.execute(command());

        expect(staffRepository.delete).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_STAFF_ID }),
        );
    });

    it('publishes RestaurantStaffRemovedEvent on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());
        staffRepository.findManyByRestaurantId.mockResolvedValue([targetStaff()]);

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantStaffRemovedEvent)]),
        );
    });
});
