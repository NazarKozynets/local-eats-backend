import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuItemName } from '../../../domain/value-objects/menu-item-name.vo';
import { MenuItemPrice } from '../../../domain/value-objects/menu-item-price.vo';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryAccessDeniedError } from '../../../domain/errors/menu-category-access-denied.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemUpdatedEvent } from '../../../domain/events/menu-item-updated.event';
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
import type { UpdateMenuItemCommand } from './update-menu-item.command';

@Injectable()
export class UpdateMenuItemUseCase {
    constructor(
        @Inject(MENU_CATEGORY_REPOSITORY)
        private readonly menuCategoryRepository: MenuCategoryRepository,
        @Inject(MENU_ITEM_REPOSITORY)
        private readonly menuItemRepository: MenuItemRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateMenuItemCommand): Promise<void> {
        const item = await this.menuItemRepository.findById(UUID.create(command.menuItemId));

        if (!item) {
            throw new MenuItemNotFoundError();
        }

        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            item.restaurantId.value,
        );

        if (!canManage) {
            throw new RestaurantCatalogAccessDeniedError();
        }

        if (command.categoryId !== undefined && command.categoryId !== null) {
            const category = await this.menuCategoryRepository.findById(
                UUID.create(command.categoryId),
            );

            if (!category) {
                throw new MenuCategoryNotFoundError();
            }

            if (category.restaurantId.value !== item.restaurantId.value) {
                throw new MenuCategoryAccessDeniedError();
            }
        }

        item.updateDetails({
            categoryId:
                command.categoryId !== undefined
                    ? command.categoryId !== null
                        ? UUID.create(command.categoryId)
                        : null
                    : undefined,
            name: command.name !== undefined ? MenuItemName.create(command.name) : undefined,
            description: command.description,
            imageUrl: command.imageUrl,
            price: command.price !== undefined ? MenuItemPrice.create(command.price) : undefined,
            weightGrams: command.weightGrams,
            estimatedCookTime: command.estimatedCookTime,
            isPopular: command.isPopular,
        });

        await this.menuItemRepository.save(item);
        await this.eventPublisher.publishAll([
            new MenuItemUpdatedEvent(item.restaurantId.value, item.id.value, command.currentUserId),
        ]);
    }
}
