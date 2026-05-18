import { ApproveRestaurantUseCase } from './approve-restaurant.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { InvalidRestaurantStatusTransitionError } from '../../../domain/errors/invalid-restaurant-status-transition.error';
import { RestaurantApprovedEvent } from '../../../domain/events/restaurant-approved.event';
import { RestaurantStatus } from '../../../domain/enums/restaurant-status.enum';
import { RestaurantVerificationStatus } from '../../../domain/enums/restaurant-verification-status.enum';
import { buildRestaurant, TEST_RESTAURANT_ID } from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('ApproveRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ApproveRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ApproveRestaurantUseCase(restaurantRepository, eventPublisher);
        restaurantRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () => ({ restaurantId: TEST_RESTAURANT_ID });

    it('throws RestaurantNotFoundError when restaurant does not exist', async () => {
        restaurantRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantNotFoundError);
    });

    it('throws InvalidRestaurantStatusTransitionError when restaurant is not PENDING_VERIFICATION', async () => {
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({ status: RestaurantStatus.DRAFT }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidRestaurantStatusTransitionError,
        );
    });

    it('sets status to ACTIVE and verificationStatus to VERIFIED', async () => {
        const restaurant = buildRestaurant({ status: RestaurantStatus.PENDING_VERIFICATION });
        restaurantRepository.findById.mockResolvedValue(restaurant);

        await useCase.execute(command());

        expect(restaurant.status).toBe(RestaurantStatus.ACTIVE);
        expect(restaurant.verificationStatus).toBe(RestaurantVerificationStatus.VERIFIED);
        expect(restaurant.verifiedAt).toBeInstanceOf(Date);
    });

    it('publishes RestaurantApprovedEvent on success', async () => {
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({ status: RestaurantStatus.PENDING_VERIFICATION }),
        );

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantApprovedEvent)]),
        );
    });
});
