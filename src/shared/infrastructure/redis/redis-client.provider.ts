import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_CLIENT } from './redis.tokens';

export const RedisClientProvider: Provider = {
    provide: REDIS_CLIENT,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
        const host = config.get<string>('redis.host');
        const port = config.get<number>('redis.port');
        const password = config.get<string | undefined>('redis.password');
        const db = config.get<number>('redis.db');
        const tls = config.get<boolean>('redis.tls');

        const client = createClient({
            socket: tls
                ? { host, port, tls: true }
                : { host, port },
            password: password || undefined,
            database: db,
        });

        await client.connect();
        return client;
    },
};
