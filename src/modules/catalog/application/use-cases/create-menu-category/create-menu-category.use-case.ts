import { Inject, Injectable, Optional } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategory } from '../../../domain/entities/menu-category.entity';
import { MenuCategoryName } from '../../../domain/value-objects/menu-category-name.vo';
import { MenuCategoryAlreadyExistsError } from '../../../domain/errors/menu-category-already-exists.error';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import { MenuCategoryCreatedEvent } from '../../../domain/events/menu-category-created.event';
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
import { CACHE_SERVICE } from '../../../../../shared/infrastructure/redis/redis.tokens';
import type { CachePort } from '../../../../../shared/infrastructure/redis/cache.port';
import type { CreateMenuCategoryCommand } from './create-menu-category.command';

@Injectable()
export class CreateMenuCategoryUseCase {
    constructor(
        @Inject(MENU_CATEGORY_REPOSITORY)
        private readonly menuCategoryRepository: MenuCategoryRepository,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly eventPublisher: DomainEventPublisher,
        @Optional() @Inject(CACHE_SERVICE)
        private readonly cacheService?: CachePort,
    ) {}

    async execute(command: CreateMenuCategoryCommand): Promise<void> {
        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            command.restaurantId,
        );

        if (!canManage) {
            throw new RestaurantCatalogAccessDeniedError();
        }

        const exists = await this.menuCategoryRepository.existsByNameInRestaurant(
            UUID.create(command.restaurantId),
            command.name,
        );

        if (exists) {
            throw new MenuCategoryAlreadyExistsError();
        }

        const category = MenuCategory.create({
            id: UUID.generate(),
            restaurantId: UUID.create(command.restaurantId),
            name: MenuCategoryName.create(command.name),
            position: command.position,
        });

        await this.menuCategoryRepository.save(category);
        await this.eventPublisher.publishAll([
            new MenuCategoryCreatedEvent(command.restaurantId, category.id.value, command.currentUserId),
        ]);
        await this.cacheService?.delete(`catalog:public:${command.restaurantId}`);
    }
}
