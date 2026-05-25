import { Global, Module, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { RedisClientProvider } from './redis-client.provider';
import { RedisCacheService } from './redis-cache.service';
import { RedisLockService } from './redis-lock.service';
import { CACHE_SERVICE, DISTRIBUTED_LOCK_SERVICE, REDIS_CLIENT } from './redis.tokens';
import type { IRedisClient } from './redis-client.interface';

@Global()
@Module({
    providers: [
        RedisClientProvider,
        { provide: CACHE_SERVICE, useClass: RedisCacheService },
        { provide: DISTRIBUTED_LOCK_SERVICE, useClass: RedisLockService },
    ],
    exports: [CACHE_SERVICE, DISTRIBUTED_LOCK_SERVICE],
})
export class RedisModule implements OnModuleInit, OnApplicationShutdown {
    private readonly client: IRedisClient;

    constructor(@Inject(REDIS_CLIENT) client: IRedisClient) {
        this.client = client;
    }

    async onModuleInit(): Promise<void> {
        // Client connects in the factory provider; nothing to do here.
    }

    async onApplicationShutdown(): Promise<void> {
        await this.client.quit();
    }
}
