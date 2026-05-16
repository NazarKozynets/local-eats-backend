import {registerAs} from "@nestjs/config";

const DEFAULT_ACCESS_EXPIRES_IN = "15m";
const DEFAULT_REFRESH_EXPIRES_IN = "30d";

export const jwtConfig = registerAs("jwt", () => ({
    accessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
    refreshSecret: getRequiredEnv("JWT_REFRESH_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? DEFAULT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? DEFAULT_REFRESH_EXPIRES_IN,
}));

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}
