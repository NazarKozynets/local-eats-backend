import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CachePort } from './cache.port';
import { REDIS_CLIENT } from './redis.tokens';
import type { IRedisClient } from './redis-client.interface';

@Injectable()
export class RedisCacheService implements CachePort {
    private readonly logger = new Logger(RedisCacheService.name);
    private readonly prefix: string;
    private readonly client: IRedisClient;

    constructor(
        @Inject(REDIS_CLIENT) client: IRedisClient,
        private readonly config: ConfigService,
    ) {
        this.client = client;
        this.prefix = config.get<string>('redis.keyPrefix') ?? 'local-eats';
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.client.get(this.buildKey(key));
            if (raw === null) return null;
            return JSON.parse(raw) as T;
        } catch (err) {
            this.logger.warn(`Cache get failed for key "${key}": ${err}`);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        try {
            await this.client.set(this.buildKey(key), JSON.stringify(value), { EX: ttlSeconds });
        } catch (err) {
            this.logger.warn(`Cache set failed for key "${key}": ${err}`);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.client.del(this.buildKey(key));
        } catch (err) {
            this.logger.warn(`Cache delete failed for key "${key}": ${err}`);
        }
    }

    async deleteByPattern(pattern: string): Promise<void> {
        try {
            const fullPattern = this.buildKey(pattern);
            const keys: string[] = [];
            for await (const key of this.client.scanIterator({ MATCH: fullPattern, COUNT: 100 })) {
                keys.push(key);
            }
            if (keys.length > 0) {
                const [first, ...rest] = keys;
                await this.client.del(first, ...rest);
            }
        } catch (err) {
            this.logger.warn(`Cache deleteByPattern failed for pattern "${pattern}": ${err}`);
        }
    }

    async remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) return cached;

        const value = await factory();
        await this.set(key, value, ttlSeconds);
        return value;
    }

    private buildKey(key: string): string {
        return `${this.prefix}:${key}`;
    }
}
