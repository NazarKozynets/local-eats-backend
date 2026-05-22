import { Inject, Injectable } from '@nestjs/common';
import { RestaurantCatalogAccessDeniedError } from '../../../domain/errors/restaurant-catalog-access-denied.error';
import {
    CATALOG_READER,
    type CatalogReader,
    type CatalogReadModel,
} from '../../ports/catalog-reader.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import type { GetRestaurantCatalogCommand } from './get-restaurant-catalog.command';

@Injectable()
export class GetRestaurantCatalogUseCase {
    constructor(
        @Inject(CATALOG_READER)
        private readonly catalogReader: CatalogReader,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
    ) {}

    async execute(command: GetRestaurantCatalogCommand): Promise<CatalogReadModel> {
        const canManage = await this.restaurantAccessReader.canManageRestaurant(
            command.currentUserId,
            command.restaurantId,
        );

        if (!canManage) {
            throw new RestaurantCatalogAccessDeniedError();
        }

        return this.catalogReader.getManagerCatalog(command.restaurantId);
    }
}
