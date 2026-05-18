import { UpdateRestaurantUseCase } from './update-restaurant.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { RestaurantUpdatedEvent } from '../../../domain/events/restaurant-updated.event';
import {
    buildRestaurant,
    buildStaff,
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockRestaurantStaffRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('UpdateRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: UpdateRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new UpdateRestaurantUseCase(restaurantRepository, staffRepository, eventPublisher);
        restaurantRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides = {}) => ({
        restaurantId: TEST_RESTAURANT_ID,
        currentUserId: TEST_USER_ID,
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

    it('updates restaurant name when provided', async () => {
        const restaurant = buildRestaurant();
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(restaurant);

        await useCase.execute(command({ name: 'New Name' }));

        expect(restaurant.name.value).toBe('New Name');
        expect(restaurantRepository.save).toHaveBeenCalledWith(restaurant);
    });

    it('publishes RestaurantUpdatedEvent on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        await useCase.execute(command({ city: 'Lviv' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantUpdatedEvent)]),
        );
    });

    it('saves before publishing event', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        const order: string[] = [];
        restaurantRepository.save.mockImplementation(async () => { order.push('save'); });
        eventPublisher.publishAll.mockImplementation(async () => { order.push('publish'); });

        await useCase.execute(command());

        expect(order).toEqual(['save', 'publish']);
    });
});
