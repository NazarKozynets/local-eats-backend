import { CreateRestaurantUseCase } from './create-restaurant.use-case';
import { CreateRestaurantCommand } from './create-restaurant.command';
import { RestaurantAccountNotFoundError } from '../../../domain/errors/restaurant-account-not-found.error';
import { RestaurantAccountNotActiveError } from '../../../domain/errors/restaurant-account-not-active.error';
import { RestaurantAccountNotManagerRoleError } from '../../../domain/errors/restaurant-account-not-manager-role.error';
import { RestaurantCreatedEvent } from '../../../domain/events/restaurant-created.event';
import { RestaurantStaffAddedEvent } from '../../../domain/events/restaurant-staff-added.event';
import {
    buildAccountSnapshot,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockRestaurantRepository,
    createMockEventPublisher,
    createMockAccountAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('CreateRestaurantUseCase', () => {
    let restaurantRepository: ReturnType<typeof createMockRestaurantRepository>;
    let accountAccessReader: ReturnType<typeof createMockAccountAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateRestaurantUseCase;

    beforeEach(() => {
        restaurantRepository = createMockRestaurantRepository();
        accountAccessReader = createMockAccountAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateRestaurantUseCase(
            restaurantRepository,
            accountAccessReader,
            eventPublisher,
        );
        restaurantRepository.createWithOwnerStaff.mockResolvedValue(undefined);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        CreateRestaurantCommand.create({
            currentUserId: TEST_USER_ID,
            name: 'Test Restaurant',
            city: 'Kyiv',
            addressText: 'Main St 1',
        });

    it('throws RestaurantAccountNotFoundError when account does not exist', async () => {
        accountAccessReader.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantAccountNotFoundError);
    });

    it('throws RestaurantAccountNotActiveError when account is not ACTIVE', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot({ status: 'BLOCKED' }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantAccountNotActiveError);
    });

    it('throws RestaurantAccountNotManagerRoleError when account role is not RESTAURANT_MANAGER', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot({ role: 'CUSTOMER' }));

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantAccountNotManagerRoleError);
    });

    it('creates restaurant and owner staff atomically', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot());

        await useCase.execute(command());

        expect(restaurantRepository.createWithOwnerStaff).toHaveBeenCalledTimes(1);
    });

    it('publishes RestaurantCreatedEvent and RestaurantStaffAddedEvent on success', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot());

        await useCase.execute(command());

        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.any(RestaurantCreatedEvent),
                expect.any(RestaurantStaffAddedEvent),
            ]),
        );
    });

    it('creates restaurant with DRAFT status and UNVERIFIED verification', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot());
        let capturedRestaurant: any;
        restaurantRepository.createWithOwnerStaff.mockImplementation(async (restaurant) => {
            capturedRestaurant = restaurant;
        });

        await useCase.execute(command());

        expect(capturedRestaurant.status).toBe('DRAFT');
        expect(capturedRestaurant.verificationStatus).toBe('UNVERIFIED');
    });
});
