import {registerAs} from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
    url: getRequiredEnv("DATABASE_URL"),
}));

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}
