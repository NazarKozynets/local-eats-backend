import { RejectRestaurantUseCase } from './reject-restaurant.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { InvalidRestaurantStatusTransitionError } from '../../../domain/errors/invalid-restaurant-status-transition.error';
import { RestaurantRejectedEvent } from '../../../domain/events/restaurant-rejected.event';
import { RestaurantStatus } from '../../../domain/enums/restaurant-status.enum';
import { RestaurantVerificationStatus } from '../../../domain/enums/restaurant-verification-status.enum';
import { buildRestaurant, TEST_RESTAURANT_ID } from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('RejectRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: RejectRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new RejectRestaurantUseCase(restaurantRepository, eventPublisher);
        restaurantRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = (overrides = {}) => ({
        restaurantId: TEST_RESTAURANT_ID,
        reason: 'Incomplete information',
        ...overrides,
    });

    it('throws RestaurantNotFoundError when restaurant does not exist', async () => {
        restaurantRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotFoundError);
    });

    it('throws InvalidRestaurantStatusTransitionError when not PENDING_VERIFICATION', async () => {
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({ status: RestaurantStatus.DRAFT }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidRestaurantStatusTransitionError,
        );
    });

    it('sets status to REJECTED and records the rejection reason', async () => {
        const restaurant = buildRestaurant({ status: RestaurantStatus.PENDING_VERIFICATION });
        restaurantRepository.findById.mockResolvedValue(restaurant);

        await useCase.execute(command({ reason: 'Missing menu' }));

        expect(restaurant.status).toBe(RestaurantStatus.REJECTED);
        expect(restaurant.verificationStatus).toBe(RestaurantVerificationStatus.REJECTED);
        expect(restaurant.verificationRejectedReason).toBe('Missing menu');
    });

    it('publishes RestaurantRejectedEvent with reason on success', async () => {
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({ status: RestaurantStatus.PENDING_VERIFICATION }),
        );

        await useCase.execute(command({ reason: 'Bad photos' }));

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantRejectedEvent)]),
        );
    });
});
