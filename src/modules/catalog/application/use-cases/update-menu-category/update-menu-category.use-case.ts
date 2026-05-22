import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategoryName } from '../../../domain/value-objects/menu-category-name.vo';
import { MenuCategoryNotFoundError } from '../../../domain/errors/menu-category-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuCategoryUpdatedEvent } from '../../../domain/events/menu-category-updated.event';
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
import type { UpdateMenuCategoryCommand } from './update-menu-category.command';

@Injectable()
export class UpdateMenuCategoryUseCase {
    constructor(
        @Inject(MENU_CATEGORY_REPOSITORY)
        private readonly menuCategoryRepository: MenuCategoryRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: UpdateMenuCategoryCommand): Promise<void> {
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

        if (command.name !== undefined) {
            category.rename(MenuCategoryName.create(command.name));
        }

        if (command.position !== undefined) {
            category.changePosition(command.position);
        }

        if (command.isActive !== undefined) {
            command.isActive ? category.activate() : category.deactivate();
        }

        await this.menuCategoryRepository.save(category);
        await this.eventPublisher.publishAll([
            new MenuCategoryUpdatedEvent(
                category.restaurantId.value,
                category.id.value,
                command.currentUserId,
            ),
        ]);
    }
}
