import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreateCourierProfileUseCase } from '../../application/use-cases/create-courier-profile/create-courier-profile.use-case';
import { GetMyCourierProfileUseCase } from '../../application/use-cases/get-my-courier-profile/get-my-courier-profile.use-case';
import { UpdateCourierProfileUseCase } from '../../application/use-cases/update-courier-profile/update-courier-profile.use-case';
import { SubmitCourierForVerificationUseCase } from '../../application/use-cases/submit-courier-for-verification/submit-courier-for-verification.use-case';
import { PauseCourierUseCase } from '../../application/use-cases/pause-courier/pause-courier.use-case';
import { ActivateCourierUseCase } from '../../application/use-cases/activate-courier/activate-courier.use-case';
import { SetCourierAvailabilityUseCase } from '../../application/use-cases/set-courier-availability/set-courier-availability.use-case';
import { UpdateCourierLocationUseCase } from '../../application/use-cases/update-courier-location/update-courier-location.use-case';
import { CreateCourierProfileRequestDto } from './dto/create-courier-profile.request.dto';
import { UpdateCourierProfileRequestDto } from './dto/update-courier-profile.request.dto';
import { SetCourierAvailabilityRequestDto } from './dto/set-courier-availability.request.dto';
import { UpdateCourierLocationRequestDto } from './dto/update-courier-location.request.dto';
import { CourierProfileResponseDto } from './dto/courier-profile.response.dto';

@Controller('couriers/me')
@UseGuards(JwtAuthGuard)
@ApiTags('Couriers')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class CouriersController {
    constructor(
        private readonly createCourierProfileUseCase: CreateCourierProfileUseCase,
        private readonly getMyCourierProfileUseCase: GetMyCourierProfileUseCase,
        private readonly updateCourierProfileUseCase: UpdateCourierProfileUseCase,
        private readonly submitForVerificationUseCase: SubmitCourierForVerificationUseCase,
        private readonly pauseCourierUseCase: PauseCourierUseCase,
        private readonly activateCourierUseCase: ActivateCourierUseCase,
        private readonly setCourierAvailabilityUseCase: SetCourierAvailabilityUseCase,
        private readonly updateCourierLocationUseCase: UpdateCourierLocationUseCase,
    ) {}

    @Post('profile')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create courier profile for current user' })
    @ApiBody({ type: CreateCourierProfileRequestDto })
    @ApiCreatedResponse({ description: 'Courier profile created' })
    @ApiForbiddenResponse({ description: 'Account must be active with COURIER role' })
    @ApiConflictResponse({ description: 'Courier profile already exists' })
    async createProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateCourierProfileRequestDto,
    ): Promise<void> {
        return this.createCourierProfileUseCase.execute({
            currentUserId: user.userId,
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl,
            vehicleType: dto.vehicleType,
            deliveryRadiusKm: dto.deliveryRadiusKm,
        });
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get current courier profile' })
    @ApiOkResponse({ type: CourierProfileResponseDto })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    async getMyProfile(@CurrentUser() user: AuthUser): Promise<CourierProfileResponseDto> {
        return this.getMyCourierProfileUseCase.execute({ currentUserId: user.userId });
    }

    @Patch('profile')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update courier profile' })
    @ApiBody({ type: UpdateCourierProfileRequestDto })
    @ApiNoContentResponse({ description: 'Profile updated' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Blocked couriers cannot update their profile' })
    async updateProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateCourierProfileRequestDto,
    ): Promise<void> {
        return this.updateCourierProfileUseCase.execute({
            currentUserId: user.userId,
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl,
            vehicleType: dto.vehicleType,
            deliveryRadiusKm: dto.deliveryRadiusKm,
        });
    }

    @Patch('submit-for-verification')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Submit courier profile for admin verification' })
    @ApiNoContentResponse({ description: 'Submitted for verification' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Invalid verification status transition' })
    async submitForVerification(@CurrentUser() user: AuthUser): Promise<void> {
        return this.submitForVerificationUseCase.execute({ currentUserId: user.userId });
    }

    @Patch('pause')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Pause courier profile (go off duty)' })
    @ApiNoContentResponse({ description: 'Courier paused' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Courier must be ACTIVE to pause' })
    async pause(@CurrentUser() user: AuthUser): Promise<void> {
        return this.pauseCourierUseCase.execute({ currentUserId: user.userId });
    }

    @Patch('activate')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Activate courier profile (resume from pause)' })
    @ApiNoContentResponse({ description: 'Courier activated' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Courier must be PAUSED and VERIFIED to activate' })
    async activate(@CurrentUser() user: AuthUser): Promise<void> {
        return this.activateCourierUseCase.execute({ currentUserId: user.userId });
    }

    @Patch('availability')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Set courier availability status' })
    @ApiBody({ type: SetCourierAvailabilityRequestDto })
    @ApiNoContentResponse({ description: 'Availability updated' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Cannot go ONLINE — courier must be VERIFIED and ACTIVE' })
    async setAvailability(
        @CurrentUser() user: AuthUser,
        @Body() dto: SetCourierAvailabilityRequestDto,
    ): Promise<void> {
        return this.setCourierAvailabilityUseCase.execute({
            currentUserId: user.userId,
            availabilityStatus: dto.availabilityStatus,
        });
    }

    @Patch('location')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update courier current location' })
    @ApiBody({ type: UpdateCourierLocationRequestDto })
    @ApiNoContentResponse({ description: 'Location updated' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    async updateLocation(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateCourierLocationRequestDto,
    ): Promise<void> {
        return this.updateCourierLocationUseCase.execute({
            currentUserId: user.userId,
            latitude: dto.latitude,
            longitude: dto.longitude,
        });
    }
}
