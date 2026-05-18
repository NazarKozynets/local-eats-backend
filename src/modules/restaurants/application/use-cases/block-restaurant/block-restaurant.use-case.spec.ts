import { BlockRestaurantUseCase } from './block-restaurant.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantBlockedEvent } from '../../../domain/events/restaurant-blocked.event';
import { RestaurantStatus } from '../../../domain/enums/restaurant-status.enum';
import { buildRestaurant, TEST_RESTAURANT_ID } from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('BlockRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: BlockRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new BlockRestaurantUseCase(restaurantRepository, eventPublisher);
        restaurantRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () => ({ restaurantId: TEST_RESTAURANT_ID });

    it('throws RestaurantNotFoundError when restaurant does not exist', async () => {
        restaurantRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotFoundError);
    });

    it('sets status to BLOCKED regardless of current status', async () => {
        const restaurant = buildRestaurant({ status: RestaurantStatus.ACTIVE });
        restaurantRepository.findById.mockResolvedValue(restaurant);

        await useCase.execute(command());

        expect(restaurant.status).toBe(RestaurantStatus.BLOCKED);
    });

    it('publishes RestaurantBlockedEvent on success', async () => {
        restaurantRepository.findById.mockResolvedValue(buildRestaurant());

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantBlockedEvent)]),
        );
    });
});
