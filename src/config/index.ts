import {appConfig} from "./app.config";
import {databaseConfig} from "./database.config";
import {jwtConfig} from "./jwt.config";
import {redisConfig} from "./redis.config";

export const configurations = [
    appConfig,
    databaseConfig,
    jwtConfig,
    redisConfig,
];

export {appConfig, databaseConfig, jwtConfig, redisConfig};
