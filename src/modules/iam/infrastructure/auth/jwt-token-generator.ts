import { randomUUID } from 'crypto';
import {TokenGenerator, TokenPayload} from "../../application/services/token-generator.port";
import {JwtService, type JwtSignOptions} from "@nestjs/jwt";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async generateAccessToken(payload: TokenPayload): Promise<string> {
        return this.jwtService.signAsync({
            sub: payload.userId,
            role: payload.role,
        }, {
            secret: this.configService.getOrThrow<string>("jwt.accessSecret"),
            expiresIn: this.getExpiresIn("jwt.accessExpiresIn"),
        });
    }

    async generateRefreshToken(payload: TokenPayload): Promise<string> {
        return this.jwtService.signAsync({
            sub: payload.userId,
            role: payload.role,
            tokenType: 'refresh',
            jti: randomUUID(),
        }, {
            secret: this.configService.getOrThrow<string>("jwt.refreshSecret"),
            expiresIn: this.getExpiresIn("jwt.refreshExpiresIn"),
        });
    }

    private getExpiresIn(configKey: string): JwtSignOptions["expiresIn"] {
        return this.configService.getOrThrow<JwtSignOptions["expiresIn"]>(configKey);
    }
}