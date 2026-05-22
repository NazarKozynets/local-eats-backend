import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';
import { MenuItemNotFoundError } from '../../../domain/errors/menu-item-not-found.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuItemStatusChangedEvent } from '../../../domain/events/menu-item-status-changed.event';
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
import type { ChangeMenuItemStatusCommand } from './change-menu-item-status.command';

@Injectable()
export class ChangeMenuItemStatusUseCase {
    constructor(
        @Inject(MENU_ITEM_REPOSITORY)
        private readonly menuItemRepository: MenuItemRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
    ) {}

    async execute(command: ChangeMenuItemStatusCommand): Promise<void> {
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

        switch (command.status) {
            case MenuItemStatus.AVAILABLE:
                item.markAvailable();
                break;
            case MenuItemStatus.UNAVAILABLE:
                item.markUnavailable();
                break;
            case MenuItemStatus.HIDDEN:
                item.hide();
                break;
        }

        await this.menuItemRepository.save(item);
        await this.eventPublisher.publishAll([
            new MenuItemStatusChangedEvent(
                item.restaurantId.value,
                item.id.value,
                command.status,
                command.currentUserId,
            ),
        ]);
    }
}
