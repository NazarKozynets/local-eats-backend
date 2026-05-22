import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { MenuCategoryHasItemsError } from '../../../domain/errors/menu-category-has-items.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuCategoryDeletedEvent } from '../../../domain/events/menu-category-deleted.event';
import {
    MENU_CATEGORY_REPOSITORY,
    type MenuCategoryRepository,
} from '../../ports/menu-category.repository.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import {
    DOMAIN_EVENT_PUBLISHER,
    type DomainEventPublisher,
} from '../../../../../shared/domain/events/domain-event-publisher.port';
import type { DeleteMenuCategoryCommand } from './delete-menu-category.command';

@Injectable()
export class DeleteMenuCategoryUseCase {
    constructor(
        @Inject(MENU_CATEGORY_REPOSITORY)
        private readonly menuCategoryRepository: MenuCategoryRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: DeleteMenuCategoryCommand): Promise<void> {
        const category = await this.menuCategoryRepository.findById(UUID.create(command.categoryId));

        if (!category) {
            throw new MenuCategoryNotFoundError();
        }

        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            category.restaurantId.value,
        );

        if (!canManage) {
            throw new RestaurantCatalogAccessDeniedError();
        }

        const hasItems = await this.menuCategoryRepository.hasItems(category.id);

        if (hasItems) {
            throw new MenuCategoryHasItemsError();
        }

        await this.menuCategoryRepository.delete(category.id);
        await this.eventPublisher.publishAll([
            new MenuCategoryDeletedEvent(
                category.restaurantId.value,
                category.id.value,
                command.currentUserId,
            ),
        ]);
    }
}
