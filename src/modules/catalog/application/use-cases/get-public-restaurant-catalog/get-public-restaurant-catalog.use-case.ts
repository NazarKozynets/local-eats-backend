import { Inject, Injectable, Optional } from '@nestjs/common';
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
import { CACHE_SERVICE } from '../../../../../shared/infrastructure/redis/redis.tokens';
import type { CachePort } from '../../../../../shared/infrastructure/redis/cache.port';
import type { GetPublicRestaurantCatalogCommand } from './get-public-restaurant-catalog.command';

const CATALOG_CACHE_TTL_SECONDS = 60;

@Injectable()
export class GetPublicRestaurantCatalogUseCase {
    constructor(
        @Inject(CATALOG_READER)
        private readonly catalogReader: CatalogReader,
        @Inject(RESTAURANT_ACCESS_READER)
        private readonly restaurantAccessReader: RestaurantAccessReader,
        @Optional() @Inject(CACHE_SERVICE)
        private readonly cacheService?: CachePort,
    ) {}

    async execute(command: GetPublicRestaurantCatalogCommand): Promise<CatalogReadModel> {
        const isActive = await this.restaurantAccessReader.existsActiveRestaurant(
            command.restaurantId,
        );

        if (!isActive) {
            throw new RestaurantNotAvailableForPublicCatalogError();
        }

        const cacheKey = `catalog:public:${command.restaurantId}`;

        if (this.cacheService) {
            return this.cacheService.remember<CatalogReadModel>(
                cacheKey,
                CATALOG_CACHE_TTL_SECONDS,
                () => this.catalogReader.getPublicCatalog(command.restaurantId),
            );
        }

        return this.catalogReader.getPublicCatalog(command.restaurantId);
    }
}
