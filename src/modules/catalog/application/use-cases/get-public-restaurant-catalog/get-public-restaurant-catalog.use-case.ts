import { Inject, Injectable } from '@nestjs/common';
import { RestaurantNotAvailableForPublicCatalogError } from '../../../domain/errors/restaurant-not-available-for-public-catalog.error';
import {
    CATALOG_READER,
    type CatalogReader,
    type CatalogReadModel,
} from '../../ports/catalog-reader.port';
import {
    RESTAURANT_ACCESS_READER,
    type RestaurantAccessReader,
} from '../../../../restaurants/application/ports/restaurant-access-reader.port';
import type { GetPublicRestaurantCatalogCommand } from './get-public-restaurant-catalog.command';

@Injectable()
export class GetPublicRestaurantCatalogUseCase {
    constructor(
        @Inject(CATALOG_READER)
        private readonly catalogReader: CatalogReader,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
    ) {}

    async execute(command: GetPublicRestaurantCatalogCommand): Promise<CatalogReadModel> {
        const isActive = await this.restaurantAccessReader.existsActiveRestaurant(
            command.restaurantId,
        );

        if (!isActive) {
            throw new RestaurantNotAvailableForPublicCatalogError();
        }

        return this.catalogReader.getPublicCatalog(command.restaurantId);
    }
}
