import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../shared/infrastructure/redis/redis.tokens';
import type { CachePort } from '../../../../shared/infrastructure/redis/cache.port';
import type { RestaurantApprovedEvent } from '../../../restaurants/domain/events/restaurant-approved.event';
import type { RestaurantRejectedEvent } from '../../../restaurants/domain/events/restaurant-rejected.event';
import type { RestaurantPausedEvent } from '../../../restaurants/domain/events/restaurant-paused.event';
import type { RestaurantActivatedEvent } from '../../../restaurants/domain/events/restaurant-activated.event';
import type { RestaurantBlockedEvent } from '../../../restaurants/domain/events/restaurant-blocked.event';

type RestaurantStatusEvent =
    | RestaurantApprovedEvent
    | RestaurantRejectedEvent
    | RestaurantPausedEvent
    | RestaurantActivatedEvent
    | RestaurantBlockedEvent;

@Injectable()
export class OnRestaurantStatusChangedHandler {
    private readonly logger = new Logger(OnRestaurantStatusChangedHandler.name);

    constructor(
        @Optional() @Inject(CACHE_SERVICE) private readonly cacheService: CachePort | null,
    ) {}

    async handle(event: RestaurantStatusEvent): Promise<void> {
        if (!this.cacheService) return;
        const key = `catalog:public:${event.restaurantId}`;
        await this.cacheService.delete(key);
        this.logger.debug(`Catalog cache invalidated for restaurant ${event.restaurantId}`);
    }
}
