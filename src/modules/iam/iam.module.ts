import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule, type JwtSignOptions} from "@nestjs/jwt";
import {PrismaAccountRepository} from "./infrastructure/persistence/prisma-account.repository";
import {PrismaSessionRepository} from "./infrastructure/persistence/prisma-session.repository";
import {RegisterUseCase} from "./application/use-cases/register/register.use-case";
import {USER_REPOSITORY} from "./domain/repositories/account.repository";
import {SESSION_REPOSITORY} from "./domain/repositories/session.repository";
import {PASSWORD_HASHER} from "./application/services/password-hasher.port";
import {BcryptPasswordHasher} from "./infrastructure/auth/bcrypt-password-hasher";
import {TOKEN_GENERATOR} from "./application/services/token-generator.port";
import {JwtTokenGenerator} from "./infrastructure/auth/jwt-token-generator";
import {LoginWithPasswordUseCase} from "./application/use-cases/login-with-password/login-with-password.use-case";
import {TOKEN_HASHER} from "./application/services/token-hasher.port";
import {Sha256TokenHasher} from "./infrastructure/auth/sha256-token-hasher";
import {LogoutUseCase} from "./application/use-cases/logout/logout.use-case";
import {BlockUserUseCase} from "./application/use-cases/block-user/block-user.use-case";
import {ChangePasswordUseCase} from "./application/use-cases/change-password/change-password.use-case";
import {ChangeUserRoleUseCase} from "./application/use-cases/change-user-role/change-user-role.use-case";
import {DeleteUserUseCase} from "./application/use-cases/delete-user/delete-user.use-case";
import {GetCurrentUserUseCase} from "./application/use-cases/get-current-user/get-current-user.use-case";
import {LoginWithAppleUseCase} from "./application/use-cases/login-with-apple/login-with-apple.use-case";
import {LoginWithGoogleUseCase} from "./application/use-cases/login-with-google/login-with-google.use-case";
import {LogoutAllSessionsUseCase} from "./application/use-cases/logout-all-sessions/logout-all-sessions.use-case";
import {RefreshTokenUseCase} from "./application/use-cases/refresh-token/refresh-token.use-case";
import {RequestEmailVerificationUseCase} from "./application/use-cases/request-email-verification/request-email-verification.use-case";
import {RequestPasswordResetUseCase} from "./application/use-cases/request-password-reset/request-password-reset.use-case";
import {RequestPhoneVerificationUseCase} from "./application/use-cases/request-phone-verification/request-phone-verification.use-case";
import {ResetPasswordUseCase} from "./application/use-cases/reset-password/reset-password.use-case";
import {UnblockUserUseCase} from "./application/use-cases/unblock-user/unblock-user.use-case";
import {VerifyEmailUseCase} from "./application/use-cases/verify-email/verify-email.use-case";
import {VerifyPhoneUseCase} from "./application/use-cases/verify-phone/verify-phone.use-case";
import {AuthController} from "./presentation/controllers/auth.controller";
import {AccountController} from "./presentation/controllers/account.controller";
import {AdminIamController} from "./presentation/controllers/admin-iam.controller";
import {JwtAuthGuard} from "./presentation/guards/jwt-auth.guard";
import {RolesGuard} from "./presentation/guards/roles.guard";
import {ACCOUNT_ACCESS_READER} from "./application/ports/account-access-reader.port";
import {PrismaAccountAccessReader} from "./infrastructure/readers/prisma-account-access.reader";

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>("jwt.accessSecret"),
                signOptions: {
                    expiresIn: configService.getOrThrow<JwtSignOptions["expiresIn"]>("jwt.accessExpiresIn"),
                },
            }),
        }),
    ],
    controllers: [
        AuthController,
        AccountController,
        AdminIamController,
    ],
    providers: [
        {
            provide: USER_REPOSITORY,
            useClass: PrismaAccountRepository,
        },
        {
            provide: SESSION_REPOSITORY,
            useClass: PrismaSessionRepository,
        },
        {
            provide: PASSWORD_HASHER,
            useClass: BcryptPasswordHasher,
        },
        {
            provide: TOKEN_GENERATOR,
            useClass: JwtTokenGenerator,
        },
        {
            provide: TOKEN_HASHER,
            useClass: Sha256TokenHasher,
        },
        {
            provide: ACCOUNT_ACCESS_READER,
            useClass: PrismaAccountAccessReader,
        },
        RegisterUseCase,
        LoginWithPasswordUseCase,
        LogoutUseCase,
        BlockUserUseCase,
        ChangePasswordUseCase,
        ChangeUserRoleUseCase,
        DeleteUserUseCase,
        GetCurrentUserUseCase,
        LoginWithAppleUseCase,
        LoginWithGoogleUseCase,
        LogoutAllSessionsUseCase,
        RefreshTokenUseCase,
        RequestEmailVerificationUseCase,
        RequestPasswordResetUseCase,
        RequestPhoneVerificationUseCase,
        ResetPasswordUseCase,
        UnblockUserUseCase,
        VerifyEmailUseCase,
        VerifyPhoneUseCase,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        ACCOUNT_ACCESS_READER,
        JwtModule,
        JwtAuthGuard,
        RolesGuard,
    ]
})
export class IamModule {}
