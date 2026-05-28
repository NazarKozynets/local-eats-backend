import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MENU_CATEGORY_REPOSITORY } from './application/ports/menu-category.repository.port';
import { MENU_ITEM_REPOSITORY } from './application/ports/menu-item.repository.port';
import { CATALOG_READER } from './application/ports/catalog-reader.port';
import { PrismaMenuCategoryRepository } from './infrastructure/persistence/prisma-menu-category.repository';
import { PrismaMenuItemRepository } from './infrastructure/persistence/prisma-menu-item.repository';
import { PrismaCatalogReader } from './infrastructure/readers/prisma-catalog-reader';
import { InProcessDomainEventPublisher } from '../../shared/infrastructure/events/in-process-domain-event-publisher';
import { OnRestaurantStatusChangedHandler } from './application/event-handlers/on-restaurant-status-changed.handler';
import { CreateMenuCategoryUseCase } from './application/use-cases/create-menu-category/create-menu-category.use-case';
import { UpdateMenuCategoryUseCase } from './application/use-cases/update-menu-category/update-menu-category.use-case';
import { DeleteMenuCategoryUseCase } from './application/use-cases/delete-menu-category/delete-menu-category.use-case';
import { CreateMenuItemUseCase } from './application/use-cases/create-menu-item/create-menu-item.use-case';
import { UpdateMenuItemUseCase } from './application/use-cases/update-menu-item/update-menu-item.use-case';
import { ChangeMenuItemStatusUseCase } from './application/use-cases/change-menu-item-status/change-menu-item-status.use-case';
import { DeleteMenuItemUseCase } from './application/use-cases/delete-menu-item/delete-menu-item.use-case';
import { GetRestaurantCatalogUseCase } from './application/use-cases/get-restaurant-catalog/get-restaurant-catalog.use-case';
import { GetPublicRestaurantCatalogUseCase } from './application/use-cases/get-public-restaurant-catalog/get-public-restaurant-catalog.use-case';
import { MenuCategoriesController } from './presentation/http/menu-categories.controller';
import { MenuItemsController } from './presentation/http/menu-items.controller';
import { ManagerCatalogController } from './presentation/http/manager-catalog.controller';
import { PublicCatalogController } from './presentation/http/public-catalog.controller';
import { RestaurantApprovedEvent } from '../restaurants/domain/events/restaurant-approved.event';
import { RestaurantRejectedEvent } from '../restaurants/domain/events/restaurant-rejected.event';
import { RestaurantPausedEvent } from '../restaurants/domain/events/restaurant-paused.event';
import { RestaurantActivatedEvent } from '../restaurants/domain/events/restaurant-activated.event';
import { RestaurantBlockedEvent } from '../restaurants/domain/events/restaurant-blocked.event';

@Module({
    imports: [IamModule, RestaurantsModule],
    controllers: [
        MenuCategoriesController,
        MenuItemsController,
        ManagerCatalogController,
        PublicCatalogController,
    ],
    providers: [
        {
            provide: MENU_CATEGORY_REPOSITORY,
            useClass: PrismaMenuCategoryRepository,
        },
        {
            provide: MENU_ITEM_REPOSITORY,
            useClass: PrismaMenuItemRepository,
        },
        {
            provide: CATALOG_READER,
            useClass: PrismaCatalogReader,
        },
        OnRestaurantStatusChangedHandler,
        CreateMenuCategoryUseCase,
        UpdateMenuCategoryUseCase,
        DeleteMenuCategoryUseCase,
        CreateMenuItemUseCase,
        UpdateMenuItemUseCase,
        ChangeMenuItemStatusUseCase,
        DeleteMenuItemUseCase,
        GetRestaurantCatalogUseCase,
        GetPublicRestaurantCatalogUseCase,
    ],
})
export class CatalogModule implements OnModuleInit {
    constructor(
        @Inject(InProcessDomainEventPublisher)
        private readonly publisher: InProcessDomainEventPublisher,
        private readonly onRestaurantStatusChanged: OnRestaurantStatusChangedHandler,
    ) {}

    onModuleInit(): void {
        this.publisher.subscribe(RestaurantApprovedEvent, e => this.onRestaurantStatusChanged.handle(e));
        this.publisher.subscribe(RestaurantRejectedEvent, e => this.onRestaurantStatusChanged.handle(e));
        this.publisher.subscribe(RestaurantPausedEvent, e => this.onRestaurantStatusChanged.handle(e));
        this.publisher.subscribe(RestaurantActivatedEvent, e => this.onRestaurantStatusChanged.handle(e));
        this.publisher.subscribe(RestaurantBlockedEvent, e => this.onRestaurantStatusChanged.handle(e));
    }
}
