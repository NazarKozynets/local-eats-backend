import { ActivateRestaurantUseCase } from './activate-restaurant.use-case';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import { RestaurantAccessDeniedError } from '../../../domain/errors/restaurant-access-denied.error';
import { InvalidRestaurantStatusTransitionError } from '../../../domain/errors/invalid-restaurant-status-transition.error';
import { RestaurantActivatedEvent } from '../../../domain/events/restaurant-activated.event';
import { RestaurantStatus } from '../../../domain/enums/restaurant-status.enum';
import { RestaurantVerificationStatus } from '../../../domain/enums/restaurant-verification-status.enum';
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

describe('ActivateRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let staffRepository: ReturnType<typeof createMockRestaurantStaffRepository>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: ActivateRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        staffRepository = createMockRestaurantStaffRepository();
        eventPublisher = createMockEventPublisher();
        useCase = new ActivateRestaurantUseCase(restaurantRepository, staffRepository, eventPublisher);
        restaurantRepository.save.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () => ({
        restaurantId: TEST_RESTAURANT_ID,
        currentUserId: TEST_USER_ID,
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

    it('throws InvalidRestaurantStatusTransitionError when restaurant is not PAUSED', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({ status: RestaurantStatus.DRAFT }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidRestaurantStatusTransitionError,
        );
    });

    it('throws InvalidRestaurantStatusTransitionError when restaurant is PAUSED but not VERIFIED', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({
                status: RestaurantStatus.PAUSED,
                verificationStatus: RestaurantVerificationStatus.UNVERIFIED,
            }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidRestaurantStatusTransitionError,
        );
    });

    it('sets status to ACTIVE for PAUSED+VERIFIED restaurant', async () => {
        const restaurant = buildRestaurant({
            status: RestaurantStatus.PAUSED,
            verificationStatus: RestaurantVerificationStatus.VERIFIED,
        });
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(restaurant);

        await useCase.execute(command());

        expect(restaurant.status).toBe(RestaurantStatus.ACTIVE);
    });

    it('publishes RestaurantActivatedEvent on success', async () => {
        staffRepository.findByRestaurantAndUser.mockResolvedValue(buildStaff());
        restaurantRepository.findById.mockResolvedValue(
            buildRestaurant({
                status: RestaurantStatus.PAUSED,
                verificationStatus: RestaurantVerificationStatus.VERIFIED,
            }),
        );

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(RestaurantActivatedEvent)]),
        );
    });
});
