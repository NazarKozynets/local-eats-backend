import {Body, Controller, Get, Post, UseGuards} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {GetCurrentUserUseCase} from "../../application/use-cases/get-current-user/get-current-user.use-case";
import {ChangePasswordUseCase} from "../../application/use-cases/change-password/change-password.use-case";
import {LogoutAllSessionsUseCase} from "../../application/use-cases/logout-all-sessions/logout-all-sessions.use-case";
import {RequestEmailVerificationUseCase} from "../../application/use-cases/request-email-verification/request-email-verification.use-case";
import {VerifyEmailUseCase} from "../../application/use-cases/verify-email/verify-email.use-case";
import {RequestPhoneVerificationUseCase} from "../../application/use-cases/request-phone-verification/request-phone-verification.use-case";
import {VerifyPhoneUseCase} from "../../application/use-cases/verify-phone/verify-phone.use-case";
import {GetCurrentUserCommand} from "../../application/use-cases/get-current-user/get-current-user.command";
import {ChangePasswordCommand} from "../../application/use-cases/change-password/change-password.command";
import {LogoutAllSessionsCommand} from "../../application/use-cases/logout-all-sessions/logout-all-sessions.command";
import {RequestEmailVerificationCommand} from "../../application/use-cases/request-email-verification/request-email-verification.command";
import {VerifyEmailCommand} from "../../application/use-cases/verify-email/verify-email.command";
import {RequestPhoneVerificationCommand} from "../../application/use-cases/request-phone-verification/request-phone-verification.command";
import {VerifyPhoneCommand} from "../../application/use-cases/verify-phone/verify-phone.command";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {CurrentUser} from "../decorators/current-user.decorator";
import type {AuthUser} from "../types/auth-user.type";
import {ChangePasswordRequestDto} from "../dto/change-password.request.dto";
import {RequestEmailVerificationRequestDto} from "../dto/request-email-verification.request.dto";
import {VerifyEmailRequestDto} from "../dto/verify-email.request.dto";
import {RequestPhoneVerificationRequestDto} from "../dto/request-phone-verification.request.dto";
import {VerifyPhoneRequestDto} from "../dto/verify-phone.request.dto";

const currentUserResponseSchema = {
    example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        phone: null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        emailVerifiedAt: null,
        phoneVerifiedAt: null,
        blockedUntil: null,
        blockReason: null,
        createdAt: '2026-05-09T20:00:00.000Z',
        updatedAt: '2026-05-09T20:00:00.000Z',
    },
};

const successResponseSchema = {
    example: {
        success: true,
    },
};

@Controller('account')
@UseGuards(JwtAuthGuard)
@ApiTags('IAM Account')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
})
export class AccountController {
    constructor(
        private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly logoutAllSessionsUseCase: LogoutAllSessionsUseCase,
        private readonly requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
        private readonly verifyEmailUseCase: VerifyEmailUseCase,
        private readonly requestPhoneVerificationUseCase: RequestPhoneVerificationUseCase,
        private readonly verifyPhoneUseCase: VerifyPhoneUseCase,
    ) {}

    @Get('me')
    @ApiOperation({
        summary: 'Get current IAM user',
        description: 'Returns basic IAM account data for the authenticated user.',
    })
    @ApiOkResponse({
        description: 'Basic IAM user data',
        schema: currentUserResponseSchema,
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async me(@CurrentUser() user: AuthUser) {
        return this.getCurrentUserUseCase.execute(GetCurrentUserCommand.create({
            userId: user.userId,
        }));
    }

    @Post('change-password')
    @ApiOperation({
        summary: 'Change current user password',
        description: 'Changes the authenticated user password after validating the current password.',
    })
    @ApiBody({type: ChangePasswordRequestDto})
    @ApiOkResponse({
        description: 'Password changed successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid current password or missing/invalid access token',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async changePassword(
        @CurrentUser() user: AuthUser,
        @Body() dto: ChangePasswordRequestDto,
    ): Promise<void> {
        return this.changePasswordUseCase.execute(ChangePasswordCommand.create({
            userId: user.userId,
            currentPassword: dto.oldPassword,
            newPassword: dto.newPassword,
        }));
    }

    @Post('logout-all-sessions')
    @ApiOperation({
        summary: 'Logout all sessions',
        description: 'Revokes all active sessions for the authenticated IAM user.',
    })
    @ApiOkResponse({
        description: 'All sessions revoked successfully',
        schema: successResponseSchema,
    })
    async logoutAllSessions(@CurrentUser() user: AuthUser) {
        return this.logoutAllSessionsUseCase.execute(LogoutAllSessionsCommand.create({
            userId: user.userId,
        }));
    }

    @Post('email-verification/request')
    @ApiOperation({
        summary: 'Request email verification',
        description: 'Requests verification for the authenticated user email if an email exists on the IAM account.',
    })
    @ApiBody({type: RequestEmailVerificationRequestDto})
    @ApiOkResponse({
        description: 'Email verification request accepted',
        schema: successResponseSchema,
    })
    @ApiNotFoundResponse({
        description: 'User or user email not found',
    })
    async requestEmailVerification(
        @CurrentUser() user: AuthUser,
        @Body() _dto: RequestEmailVerificationRequestDto,
    ) {
        return this.requestEmailVerificationUseCase.execute(RequestEmailVerificationCommand.create({
            userId: user.userId,
        }));
    }

    @Post('email-verification/verify')
    @ApiOperation({
        summary: 'Verify email',
        description: 'Marks the authenticated user email as verified in IAM.',
    })
    @ApiBody({type: VerifyEmailRequestDto})
    @ApiOkResponse({
        description: 'Email verified successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async verifyEmail(
        @CurrentUser() user: AuthUser,
        @Body() _dto: VerifyEmailRequestDto,
    ): Promise<void> {
        return this.verifyEmailUseCase.execute(VerifyEmailCommand.create({
            userId: user.userId,
        }));
    }

    @Post('phone-verification/request')
    @ApiOperation({
        summary: 'Request phone verification',
        description: 'Requests verification for the authenticated user phone number if a phone exists on the IAM account.',
    })
    @ApiBody({type: RequestPhoneVerificationRequestDto})
    @ApiOkResponse({
        description: 'Phone verification request accepted',
        schema: successResponseSchema,
    })
    @ApiNotFoundResponse({
        description: 'User or user phone not found',
    })
    async requestPhoneVerification(
        @CurrentUser() user: AuthUser,
        @Body() _dto: RequestPhoneVerificationRequestDto,
    ) {
        return this.requestPhoneVerificationUseCase.execute(RequestPhoneVerificationCommand.create({
            userId: user.userId,
        }));
    }

    @Post('phone-verification/verify')
    @ApiOperation({
        summary: 'Verify phone',
        description: 'Marks the authenticated user phone number as verified in IAM.',
    })
    @ApiBody({type: VerifyPhoneRequestDto})
    @ApiOkResponse({
        description: 'Phone verified successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async verifyPhone(
        @CurrentUser() user: AuthUser,
        @Body() _dto: VerifyPhoneRequestDto,
    ): Promise<void> {
        return this.verifyPhoneUseCase.execute(VerifyPhoneCommand.create({
            userId: user.userId,
        }));
    }
}
