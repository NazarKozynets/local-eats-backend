import { CreateMenuCategoryUseCase } from './create-menu-category.use-case';
import { CreateMenuCategoryCommand } from './create-menu-category.command';
import { MenuCategoryAlreadyExistsError } from '../../../domain/errors/menu-category-already-exists.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { InvalidMenuCategoryNameError } from '../../../domain/errors/invalid-menu-category-name.error';
import { MenuCategoryCreatedEvent } from '../../../domain/events/menu-category-created.event';
import {
    TEST_USER_ID,
    TEST_RESTAURANT_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockMenuCategoryRepository,
    createMockRestaurantAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';

describe('CreateMenuCategoryUseCase', () => {
    let menuCategoryRepository: ReturnType<typeof createMockMenuCategoryRepository>;
    let restaurantAccessReader: ReturnType<typeof createMockRestaurantAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateMenuCategoryUseCase;

    beforeEach(() => {
        menuCategoryRepository = createMockMenuCategoryRepository();
        restaurantAccessReader = createMockRestaurantAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateMenuCategoryUseCase(
            menuCategoryRepository,
            restaurantAccessReader,
            eventPublisher,
        );
        menuCategoryRepository.save.mockResolvedValue(undefined);
        menuCategoryRepository.existsByNameInRestaurant.mockResolvedValue(false);
        eventPublisher.publishAll.mockResolvedValue(undefined);
    });

    const command = () =>
        CreateMenuCategoryCommand.create({
            currentUserId: TEST_USER_ID,
            restaurantId: TEST_RESTAURANT_ID,
            name: 'Pizza',
        });

    it('throws RestaurantCatalogAccessDeniedError when user cannot manage restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(RestaurantCatalogAccessDeniedError);
    });

    it('throws MenuCategoryAlreadyExistsError when name already exists in restaurant', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.existsByNameInRestaurant.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(MenuCategoryAlreadyExistsError);
    });

    it('throws InvalidMenuCategoryNameError for empty name', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.existsByNameInRestaurant.mockResolvedValue(false);

        await expect(
            useCase.execute(CreateMenuCategoryCommand.create({
                currentUserId: TEST_USER_ID,
                restaurantId: TEST_RESTAURANT_ID,
                name: '   ',
            })),
        ).rejects.toBeInstanceOf(InvalidMenuCategoryNameError);
    });

    it('saves the category and publishes MenuCategoryCreatedEvent on success', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.existsByNameInRestaurant.mockResolvedValue(false);

        await useCase.execute(command());

        expect(menuCategoryRepository.save).toHaveBeenCalledTimes(1);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(MenuCategoryCreatedEvent)]),
        );
    });

    it('creates category with default position 0 when position not provided', async () => {
        restaurantAccessReader.canManageRestaurant.mockResolvedValue(true);
        menuCategoryRepository.existsByNameInRestaurant.mockResolvedValue(false);
        let savedCategory: any;
        menuCategoryRepository.save.mockImplementation(async (cat) => { savedCategory = cat; });

        await useCase.execute(command());

        expect(savedCategory.position).toBe(0);
        expect(savedCategory.isActive).toBe(true);
    });
});
