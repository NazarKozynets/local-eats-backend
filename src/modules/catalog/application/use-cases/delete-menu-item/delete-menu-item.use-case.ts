import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemDeletedEvent } from '../../../domain/events/menu-item-deleted.event';
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
import type { DeleteMenuItemCommand } from './delete-menu-item.command';

@Injectable()
export class DeleteMenuItemUseCase {
    constructor(
        @Inject(MENU_ITEM_REPOSITORY)
        private readonly menuItemRepository: MenuItemRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: DeleteMenuItemCommand): Promise<void> {
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

        item.hide();

        await this.menuItemRepository.save(item);
        await this.eventPublisher.publishAll([
            new MenuItemDeletedEvent(item.restaurantId.value, item.id.value, command.currentUserId),
        ]);
    }
}
