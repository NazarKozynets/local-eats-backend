import {registerAs} from "@nestjs/config";

const DEFAULT_PORT = 3000;

export const appConfig = registerAs("app", () => ({
    port: parseNumber(process.env.PORT, DEFAULT_PORT),
}));

function parseNumber(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
