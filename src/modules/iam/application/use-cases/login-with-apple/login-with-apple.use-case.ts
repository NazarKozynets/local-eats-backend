import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {SESSION_REPOSITORY} from "../../../domain/repositories/session.repository";
import type {SessionRepository} from "../../../domain/repositories/session.repository";
import {TOKEN_GENERATOR} from "../../services/token-generator.port";
import type {TokenGenerator} from "../../services/token-generator.port";
import {TOKEN_HASHER} from "../../services/token-hasher.port";
import type {TokenHasher} from "../../services/token-hasher.port";
import {Email} from "../../../../../shared/domain/value-objects/email.vo";
import {UUID} from "../../../../../shared/domain/value-objects/uuid.vo";
import {Account} from "../../../domain/entities/account.entity";
import {UserRole} from "../../../domain/enums/user-role.enum";
import {LoginWithAppleCommand} from "./login-with-apple.command";
import type {LoginWithAppleResult} from "./login-with-apple.result";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";

const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class LoginWithAppleUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
    ) {}

    async execute(command: LoginWithAppleCommand): Promise<LoginWithAppleResult> {
        const email = Email.create(command.email);
        let user = await this.userRepository.findByEmail(email);

        if (!user) {
            user = Account.register({
                id: UUID.generate(),
                email,
                role: UserRole.CUSTOMER,
            });

            user.markEmailAsVerified();

            await this.userRepository.save(user);
        }

        if (!user.canLogin()) {
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

        await this.sessionRepository.create({
            userId: user.id.value,
            refreshTokenHash: this.tokenHasher.hash(refreshToken),
            userAgent: command.userAgent,
            ipAddress: command.ipAddress,
            deviceName: command.deviceName,
            expiresAt: this.getRefreshTokenExpiresAt(),
        });

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
