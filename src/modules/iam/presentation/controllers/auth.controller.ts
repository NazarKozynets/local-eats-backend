import {Body, Controller, HttpCode, HttpStatus, Post, Req} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type {Request} from "express";
import {RegisterUseCase} from "../../application/use-cases/register/register.use-case";
import {LoginWithPasswordUseCase} from "../../application/use-cases/login-with-password/login-with-password.use-case";
import {LoginWithGoogleUseCase} from "../../application/use-cases/login-with-google/login-with-google.use-case";
import {LoginWithAppleUseCase} from "../../application/use-cases/login-with-apple/login-with-apple.use-case";
import {RefreshTokenUseCase} from "../../application/use-cases/refresh-token/refresh-token.use-case";
import {LogoutUseCase} from "../../application/use-cases/logout/logout.use-case";
import {RequestPasswordResetUseCase} from "../../application/use-cases/request-password-reset/request-password-reset.use-case";
import {ResetPasswordUseCase} from "../../application/use-cases/reset-password/reset-password.use-case";
import {RegisterCommand} from "../../application/use-cases/register/register.command";
import {LoginWithPasswordCommand} from "../../application/use-cases/login-with-password/login-with-password.command";
import {LoginWithGoogleCommand} from "../../application/use-cases/login-with-google/login-with-google.command";
import {LoginWithAppleCommand} from "../../application/use-cases/login-with-apple/login-with-apple.command";
import {RefreshTokenCommand} from "../../application/use-cases/refresh-token/refresh-token.command";
import {LogoutCommand} from "../../application/use-cases/logout/logout.command";
import {RequestPasswordResetCommand} from "../../application/use-cases/request-password-reset/request-password-reset.command";
import {ResetPasswordCommand} from "../../application/use-cases/reset-password/reset-password.command";
import {RegisterRequestDto} from "../dto/register.request.dto";
import {LoginWithPasswordRequestDto} from "../dto/login-with-password.request.dto";
import {LoginWithGoogleRequestDto} from "../dto/login-with-google.request.dto";
import {LoginWithAppleRequestDto} from "../dto/login-with-apple.request.dto";
import {RefreshTokenRequestDto} from "../dto/refresh-token.request.dto";
import {LogoutRequestDto} from "../dto/logout.request.dto";
import {RequestPasswordResetRequestDto} from "../dto/request-password-reset.request.dto";
import {ResetPasswordRequestDto} from "../dto/reset-password.request.dto";

const authTokenResponseSchema = {
    example: {
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
        user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@example.com',
            phone: null,
            role: 'CUSTOMER',
            status: 'ACTIVE',
        },
    },
};

const successResponseSchema = {
    example: {
        success: true,
    },
};

@Controller('auth')
@ApiTags('IAM Auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginWithPasswordUseCase: LoginWithPasswordUseCase,
        private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
        private readonly loginWithAppleUseCase: LoginWithAppleUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
    ) {}

    @Post('register')
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new IAM user account. This endpoint does not create provider/customer profile details outside IAM.',
    })
    @ApiBody({type: RegisterRequestDto})
    @ApiCreatedResponse({
        description: 'User account registered successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiConflictResponse({
        description: 'User with this email or phone already exists',
    })
    async register(@Body() dto: RegisterRequestDto): Promise<void> {
        return this.registerUseCase.execute(RegisterCommand.create({
            email: dto.email,
            phone: dto.phone,
            password: dto.password,
        }));
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login with email or phone and password',
        description: 'Authenticates a user using email or phone number and password. Returns access and refresh tokens.',
    })
    @ApiBody({type: LoginWithPasswordRequestDto})
    @ApiOkResponse({
        description: 'Authentication tokens and basic IAM user data',
        schema: authTokenResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials or blocked/deleted account',
    })
    async loginWithPassword(
        @Body() dto: LoginWithPasswordRequestDto,
        @Req() request: Request,
    ) {
        return this.loginWithPasswordUseCase.execute(LoginWithPasswordCommand.create({
            identifier: dto.identifier,
            password: dto.password,
            userAgent: this.getUserAgent(request),
            ipAddress: request.ip ?? null,
            deviceName: dto.deviceName,
        }));
    }

    @Post('login/google')
    @ApiOperation({
        summary: 'Login with Google',
        description: 'Authenticates or creates an IAM user from Google email data. Returns access and refresh tokens.',
    })
    @ApiBody({type: LoginWithGoogleRequestDto})
    @ApiOkResponse({
        description: 'Authentication tokens and basic IAM user data',
        schema: authTokenResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiUnauthorizedResponse({
        description: 'User cannot login',
    })
    async loginWithGoogle(
        @Body() dto: LoginWithGoogleRequestDto,
        @Req() request: Request,
    ) {
        return this.loginWithGoogleUseCase.execute(LoginWithGoogleCommand.create({
            email: dto.email,
            userAgent: this.getUserAgent(request),
            ipAddress: request.ip ?? null,
            deviceName: dto.deviceName,
        }));
    }

    @Post('login/apple')
    @ApiOperation({
        summary: 'Login with Apple',
        description: 'Authenticates or creates an IAM user from Apple email data. Returns access and refresh tokens.',
    })
    @ApiBody({type: LoginWithAppleRequestDto})
    @ApiOkResponse({
        description: 'Authentication tokens and basic IAM user data',
        schema: authTokenResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiUnauthorizedResponse({
        description: 'User cannot login',
    })
    async loginWithApple(
        @Body() dto: LoginWithAppleRequestDto,
        @Req() request: Request,
    ) {
        return this.loginWithAppleUseCase.execute(LoginWithAppleCommand.create({
            email: dto.email,
            userAgent: this.getUserAgent(request),
            ipAddress: request.ip ?? null,
            deviceName: dto.deviceName,
        }));
    }

    @Post('refresh-token')
    @ApiOperation({
        summary: 'Refresh authentication tokens',
        description: 'Rotates the refresh token session and returns a new access token and refresh token.',
    })
    @ApiBody({type: RefreshTokenRequestDto})
    @ApiOkResponse({
        description: 'New authentication tokens and basic IAM user data',
        schema: authTokenResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid refresh token or user cannot login',
    })
    async refreshToken(@Body() dto: RefreshTokenRequestDto) {
        return this.refreshTokenUseCase.execute(RefreshTokenCommand.create({
            refreshToken: dto.refreshToken,
        }));
    }

    @Post('logout')
    @ApiOperation({
        summary: 'Logout current session',
        description: 'Revokes the session related to the provided refresh token. This operation is idempotent.',
    })
    @ApiBody({type: LogoutRequestDto})
    @ApiOkResponse({
        description: 'Session revoked successfully',
        schema: successResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    async logout(@Body() dto: LogoutRequestDto) {
        return this.logoutUseCase.execute(LogoutCommand.create({
            refreshToken: dto.refreshToken,
        }));
    }

    @Post('password-reset/request')
    @ApiOperation({
        summary: 'Request password reset',
        description: 'Accepts an email or phone number and returns a generic success response without exposing whether the account exists.',
    })
    @ApiBody({type: RequestPasswordResetRequestDto})
    @ApiOkResponse({
        description: 'Password reset request accepted',
        schema: successResponseSchema,
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    async requestPasswordReset(@Body() dto: RequestPasswordResetRequestDto) {
        return this.requestPasswordResetUseCase.execute(RequestPasswordResetCommand.create({
            identifier: dto.identifier,
        }));
    }

    @Post('password-reset/confirm')
    @ApiOperation({
        summary: 'Confirm password reset',
        description: 'Sets a new password for the IAM user identified by the request body.',
    })
    @ApiBody({type: ResetPasswordRequestDto})
    @ApiOkResponse({
        description: 'Password reset successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async resetPassword(@Body() dto: ResetPasswordRequestDto): Promise<void> {
        return this.resetPasswordUseCase.execute(ResetPasswordCommand.create({
            userId: dto.userId,
            newPassword: dto.newPassword,
        }));
    }

    private getUserAgent(request: Request): string | null {
        const userAgent = request.headers['user-agent'];

        return Array.isArray(userAgent) ? userAgent[0] : userAgent ?? null;
    }
}