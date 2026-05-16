import {registerAs} from "@nestjs/config";

const DEFAULT_REDIS_HOST = "localhost";
const DEFAULT_REDIS_PORT = 6379;

export const redisConfig = registerAs("redis", () => ({
    host: process.env.REDIS_HOST ?? DEFAULT_REDIS_HOST,
    port: parseNumber(process.env.REDIS_PORT, DEFAULT_REDIS_PORT),
}));

function parseNumber(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
