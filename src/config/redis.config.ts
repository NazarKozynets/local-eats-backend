import {registerAs} from "@nestjs/config";

const DEFAULT_REDIS_HOST = "localhost";
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DB = 0;
const DEFAULT_KEY_PREFIX = "local-eats";

export const redisConfig = registerAs("redis", () => ({
    host: process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
    port: parseNumber(process.env.REDIS_PORT, DEFAULT_REDIS_PORT),
    password: process.env.REDIS_PASSWORD ?? undefined,
    db: parseNumber(process.env.REDIS_DB, DEFAULT_REDIS_DB),
    tls: process.env.REDIS_TLS === "true",
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? DEFAULT_KEY_PREFIX,
}));

function parseNumber(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
