import { Inject, Injectable, Optional } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuItem } from '../../../domain/entities/menu-item.entity';
import { MenuItemName } from '../../../domain/value-objects/menu-item-name.vo';
import { MenuItemPrice } from '../../../domain/value-objects/menu-item-price.vo';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryAccessDeniedError } from '../../../domain/errors/menu-category-access-denied.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemCreatedEvent } from '../../../domain/events/menu-item-created.event';
import {
    MENU_CATEGORY_REPOSITORY,
    type MenuCategoryRepository,
} from '../../ports/menu-category.repository.port';
import {
    MENU_ITEM_REPOSITORY,
    type MenuItemRepository,
} from '../../ports/menu-item.repository.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import { CACHE_SERVICE } from '../../../../../shared/infrastructure/redis/redis.tokens';
import type { CachePort } from '../../../../../shared/infrastructure/redis/cache.port';
import type { CreateMenuItemCommand } from './create-menu-item.command';

@Injectable()
export class CreateMenuItemUseCase {
    constructor(
        @Inject(MENU_CATEGORY_REPOSITORY)
        private readonly menuCategoryRepository: MenuCategoryRepository,
        @Inject(MENU_ITEM_REPOSITORY)
        private readonly menuItemRepository: MenuItemRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
        @Optional() @Inject(CACHE_SERVICE)
        private readonly cacheService?: CachePort,
    ) {}

    async execute(command: CreateMenuItemCommand): Promise<void> {
        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            command.restaurantId,
        );

        if (!canManage) {
            throw new RestaurantCatalogAccessDeniedError();
        }

        if (command.categoryId) {
            const category = await this.menuCategoryRepository.findById(
                UUID.create(command.categoryId),
            );

            if (!category) {
                throw new MenuCategoryNotFoundError();
            }

            if (category.restaurantId.value !== command.restaurantId) {
                throw new MenuCategoryAccessDeniedError();
            }
        }

        const item = MenuItem.create({
            id: UUID.generate(),
            restaurantId: UUID.create(command.restaurantId),
            categoryId: command.categoryId ? UUID.create(command.categoryId) : null,
            name: MenuItemName.create(command.name),
            description: command.description,
            imageUrl: command.imageUrl,
            price: MenuItemPrice.create(command.price),
            weightGrams: command.weightGrams,
            estimatedCookTime: command.estimatedCookTime,
            isPopular: command.isPopular,
        });

        await this.menuItemRepository.save(item);
        await this.eventPublisher.publishAll([
            new MenuItemCreatedEvent(command.restaurantId, item.id.value, command.currentUserId),
        ]);
        await this.cacheService?.delete(`catalog:public:${command.restaurantId}`);
    }
}
