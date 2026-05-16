import {Inject, Injectable} from "@nestjs/common";
import {USER_REPOSITORY} from "../../../domain/repositories/account.repository";
import type {AccountRepository} from "../../../domain/repositories/account.repository";
import {LoginWithPasswordCommand} from "./login-with-password.command";
import type {LoginWithPasswordResult} from "./login-with-password.result";
import {TOKEN_GENERATOR} from "../../services/token-generator.port";
import type {TokenGenerator} from "../../services/token-generator.port";
import {PASSWORD_HASHER} from "../../services/password-hasher.port";
import type {PasswordHasher} from "../../services/password-hasher.port";
import {TOKEN_HASHER} from "../../services/token-hasher.port";
import type {TokenHasher} from "../../services/token-hasher.port";
import {SESSION_REPOSITORY} from "../../../domain/repositories/session.repository";
import type {SessionRepository} from "../../../domain/repositories/session.repository";
import {Email} from "../../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../../shared/domain/value-objects/phone-number.vo";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import type {Account} from "../../../domain/entities/account.entity";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";

const REFRESH_TOKEN_TTL_DAYS = 30;

@Injectable()
export class LoginWithPasswordUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: AccountRepository,
        @Inject(TOKEN_GENERATOR)
        private readonly tokenGenerator: TokenGenerator,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
        @Inject(TOKEN_HASHER)
        private readonly tokenHasher: TokenHasher,
        @Inject(SESSION_REPOSITORY)
        private readonly sessionRepository: SessionRepository,
    ) {
    }

    async execute(command: LoginWithPasswordCommand): Promise<LoginWithPasswordResult> {
        // Trying to find user by email or phone number
        const user = await this.findUserByIdentifier(command.identifier);

        // User not found
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Password login is not enabled for this account
        if (!user.passwordHash) {
            throw new AccessDeniedError({
                reason: "password_login_disabled",
            });
        }

        // User is blocked
        if (user.status === UserStatus.BLOCKED) {
            throw new AccessDeniedError({
                reason: "user_blocked",
            });
        }

        // User is deleted
        if (user.status === UserStatus.DELETED) {
            throw new AccessDeniedError({
                reason: "user_deleted",
            });
        }

        // Check if the password is correct
        const isPasswordValid = await this.passwordHasher.compare(
            command.password,
            user.passwordHash.value,
        );

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const tokenPayload = {
            userId: user.id.value,
            role: user.role,
        };

        // Generate access and refresh tokens
        const accessToken = await this.tokenGenerator.generateAccessToken(tokenPayload);
        const refreshToken = await this.tokenGenerator.generateRefreshToken(tokenPayload);
        const refreshTokenHash = this.tokenHasher.hash(refreshToken);
        const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();

        await this.sessionRepository.create({
            userId: user.id.value,
            refreshTokenHash,
            userAgent: command.userAgent,
            ipAddress: command.ipAddress,
            deviceName: command.deviceName,
            expiresAt: refreshTokenExpiresAt,
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

    // Find user by identifier (email or phone number)
    private async findUserByIdentifier(identifier: string): Promise<Account | null> {
        // Check if the identifier is an email or a phone number
        if (this.isEmail(identifier)) {
            const email = Email.create(identifier);
            return this.userRepository.findByEmail(email);
        }

        // If it's not an email, it's a phone number
        const phoneNumber = PhoneNumber.create(identifier);
        return this.userRepository.findByPhoneNumber(phoneNumber);
    }

    private isEmail(value: string): boolean {
        return value.includes('@');
    }

    private getRefreshTokenExpiresAt(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

        return expiresAt;
    }
}