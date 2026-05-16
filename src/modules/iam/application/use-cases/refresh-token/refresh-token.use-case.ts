import {Inject, Injectable} from "@nestjs/common";
import {SESSION_REPOSITORY} from "../../../domain/repositories/session.repository";
import type {SessionRepository} from "../../../domain/repositories/session.repository";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {TOKEN_GENERATOR} from "../../services/token-generator.port";
import type {TokenGenerator} from "../../services/token-generator.port";
import {TOKEN_HASHER} from "../../services/token-hasher.port";
import type {TokenHasher} from "../../services/token-hasher.port";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {RefreshTokenCommand} from "./refresh-token.command";
import type {RefreshTokenResult} from "./refresh-token.result";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";

const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
    ) {}

    async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
        const now = new Date();
        const currentRefreshTokenHash = this.tokenHasher.hash(command.refreshToken);
        const session = await this.sessionRepository.findActiveByRefreshTokenHash(
            currentRefreshTokenHash,
            now,
        );

        if (!session) {
            throw new InvalidCredentialsError({
                credential: "refresh_token",
            });
        }

        const user = await this.userRepository.findById(UUID.create(session.userId));

        if (!user || !user.canLogin()) {
            throw new AccessDeniedError({
                reason: "user_cannot_login",
            });
        }

        const tokenPayload = {
            userId: user.id.value,
            role: user.role,
        };
        const accessToken = await this.tokenGenerator.generateAccessToken(tokenPayload);
        const refreshToken = await this.tokenGenerator.generateRefreshToken(tokenPayload);

        await this.sessionRepository.rotateRefreshTokenHash(
            currentRefreshTokenHash,
            this.tokenHasher.hash(refreshToken),
            this.getRefreshTokenExpiresAt(),
            now,
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id.value,
                email: user.email?.value ?? null,
                phone: user.phone?.value ?? null,
                role: user.role,
                status: user.status,
            },
        };
    }

    private getRefreshTokenExpiresAt(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

        return expiresAt;
    }
}
