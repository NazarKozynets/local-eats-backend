import { OnRestaurantStatusChangedHandler } from './on-restaurant-status-changed.handler';
import { InProcessDomainEventPublisher } from '../../../../shared/infrastructure/events/in-process-domain-event-publisher';
import { RestaurantApprovedEvent } from '../../../restaurants/domain/events/restaurant-approved.event';
import { RestaurantRejectedEvent } from '../../../restaurants/domain/events/restaurant-rejected.event';
import { RestaurantPausedEvent } from '../../../restaurants/domain/events/restaurant-paused.event';
import { RestaurantActivatedEvent } from '../../../restaurants/domain/events/restaurant-activated.event';
import { RestaurantBlockedEvent } from '../../../restaurants/domain/events/restaurant-blocked.event';
import type { CachePort } from '../../../../shared/infrastructure/redis/cache.port';

const RESTAURANT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EXPECTED_KEY = `catalog:public:${RESTAURANT_ID}`;

function makeMockCache(): jest.Mocked<CachePort> {
    return {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
        deleteByPattern: jest.fn(),
        remember: jest.fn(),
    };
}

describe('OnRestaurantStatusChangedHandler', () => {
    let cache: jest.Mocked<CachePort>;
    let handler: OnRestaurantStatusChangedHandler;

    beforeEach(() => {
        cache = makeMockCache();
        handler = new OnRestaurantStatusChangedHandler(cache);
    });

    it.each([
        ['RestaurantApprovedEvent', () => new RestaurantApprovedEvent(RESTAURANT_ID)],
        ['RestaurantRejectedEvent', () => new RestaurantRejectedEvent(RESTAURANT_ID, 'reason')],
        ['RestaurantPausedEvent', () => new RestaurantPausedEvent(RESTAURANT_ID)],
        ['RestaurantActivatedEvent', () => new RestaurantActivatedEvent(RESTAURANT_ID)],
        ['RestaurantBlockedEvent', () => new RestaurantBlockedEvent(RESTAURANT_ID)],
    ])('invalidates catalog cache on %s', async (_name, buildEvent) => {
        await handler.handle(buildEvent());
        expect(cache.delete).toHaveBeenCalledWith(EXPECTED_KEY);
    });

    it('does nothing when cache service is not available', async () => {
        const noCache = new OnRestaurantStatusChangedHandler(null);
        await expect(noCache.handle(new RestaurantApprovedEvent(RESTAURANT_ID))).resolves.toBeUndefined();
    });
});

describe('Catalog cache invalidation via event publisher', () => {
    it('calls delete when restaurant events are published through the publisher', async () => {
        const cache = makeMockCache();
        const handler = new OnRestaurantStatusChangedHandler(cache);
        const publisher = new InProcessDomainEventPublisher();

        publisher.subscribe(RestaurantApprovedEvent, e => handler.handle(e));
        publisher.subscribe(RestaurantPausedEvent, e => handler.handle(e));

        await publisher.publishAll([
            new RestaurantApprovedEvent(RESTAURANT_ID),
            new RestaurantPausedEvent(RESTAURANT_ID),
        ]);

        expect(cache.delete).toHaveBeenCalledTimes(2);
        expect(cache.delete).toHaveBeenCalledWith(EXPECTED_KEY);
    });
});
