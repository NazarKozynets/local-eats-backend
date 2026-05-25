import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DistributedLock, DistributedLockPort } from './distributed-lock.port';
import { REDIS_CLIENT } from './redis.tokens';
import { RedisKeyBuilder } from './redis-key.builder';
import type { IRedisClient } from './redis-client.interface';
import { randomUUID } from 'crypto';

const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
`;

@Injectable()
export class RedisLockService implements DistributedLockPort {
    private readonly logger = new Logger(RedisLockService.name);
    private readonly prefix: string;
    private readonly client: IRedisClient;

    constructor(
        @Inject(REDIS_CLIENT) client: IRedisClient,
        private readonly config: ConfigService,
    ) {
        this.client = client;
        this.prefix = config.get<string>('redis.keyPrefix') ?? 'local-eats';
    }

    async acquire(resource: string, ttlMs: number): Promise<DistributedLock | null> {
        const key = `${this.prefix}:${RedisKeyBuilder.lock(resource)}`;
        const token = randomUUID();

        try {
            const result = await this.client.set(key, token, { NX: true, PX: ttlMs });
            if (result !== 'OK') return null;

            return {
                release: async () => {
                    try {
                        await this.client.eval(RELEASE_SCRIPT, { keys: [key], arguments: [token] });
                    } catch (err) {
                        this.logger.warn(`Lock release failed for "${resource}": ${err}`);
                    }
                },
            };
        } catch (err) {
            this.logger.warn(`Lock acquire failed for "${resource}": ${err}`);
            return null;
        }
    }
}
