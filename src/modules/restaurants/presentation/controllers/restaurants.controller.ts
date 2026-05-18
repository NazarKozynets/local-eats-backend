import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
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
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreateRestaurantUseCase } from '../../application/use-cases/create-restaurant/create-restaurant.use-case';
import { CreateRestaurantCommand } from '../../application/use-cases/create-restaurant/create-restaurant.command';
import { GetMyRestaurantsUseCase } from '../../application/use-cases/get-my-restaurants/get-my-restaurants.use-case';
import { GetRestaurantByIdUseCase } from '../../application/use-cases/get-restaurant-by-id/get-restaurant-by-id.use-case';
import { UpdateRestaurantUseCase } from '../../application/use-cases/update-restaurant/update-restaurant.use-case';
import { SubmitRestaurantForVerificationUseCase } from '../../application/use-cases/submit-restaurant-for-verification/submit-restaurant-for-verification.use-case';
import { PauseRestaurantUseCase } from '../../application/use-cases/pause-restaurant/pause-restaurant.use-case';
import { ActivateRestaurantUseCase } from '../../application/use-cases/activate-restaurant/activate-restaurant.use-case';
import { AddRestaurantStaffUseCase } from '../../application/use-cases/add-restaurant-staff/add-restaurant-staff.use-case';
import { RemoveRestaurantStaffUseCase } from '../../application/use-cases/remove-restaurant-staff/remove-restaurant-staff.use-case';
import { UpdateRestaurantWorkingHoursUseCase } from '../../application/use-cases/update-restaurant-working-hours/update-restaurant-working-hours.use-case';
import { CreateRestaurantRequestDto } from '../dto/create-restaurant.request.dto';
import { UpdateRestaurantRequestDto } from '../dto/update-restaurant.request.dto';
import { AddRestaurantStaffRequestDto } from '../dto/add-restaurant-staff.request.dto';
import { UpdateRestaurantWorkingHoursRequestDto } from '../dto/update-restaurant-working-hours.request.dto';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiTags('Restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class RestaurantsController {
    constructor(
        private readonly createRestaurantUseCase: CreateRestaurantUseCase,
        private readonly getMyRestaurantsUseCase: GetMyRestaurantsUseCase,
        private readonly getRestaurantByIdUseCase: GetRestaurantByIdUseCase,
        private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
        private readonly submitForVerificationUseCase: SubmitRestaurantForVerificationUseCase,
        private readonly pauseRestaurantUseCase: PauseRestaurantUseCase,
        private readonly activateRestaurantUseCase: ActivateRestaurantUseCase,
        private readonly addRestaurantStaffUseCase: AddRestaurantStaffUseCase,
        private readonly removeRestaurantStaffUseCase: RemoveRestaurantStaffUseCase,
        private readonly updateWorkingHoursUseCase: UpdateRestaurantWorkingHoursUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new restaurant' })
    @ApiBody({ type: CreateRestaurantRequestDto })
    @ApiCreatedResponse({ description: 'Restaurant created successfully' })
    @ApiForbiddenResponse({ description: 'Account is not active or does not have RESTAURANT_MANAGER role' })
    @ApiNotFoundResponse({ description: 'IAM account not found' })
    async create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateRestaurantRequestDto,
    ): Promise<void> {
        return this.createRestaurantUseCase.execute(
            CreateRestaurantCommand.create({
                currentUserId: user.userId,
                name: dto.name,
                description: dto.description,
                logoUrl: dto.logoUrl,
                coverUrl: dto.coverUrl,
                city: dto.city,
                addressText: dto.addressText,
                phone: dto.phone,
                email: dto.email,
                minOrderAmount: dto.minOrderAmount,
                deliveryFee: dto.deliveryFee,
            }),
        );
    }

    @Get('me')
    @ApiOperation({ summary: 'Get restaurants I am a staff member of' })
    @ApiOkResponse({ description: 'List of restaurants for current user' })
    async getMyRestaurants(@CurrentUser() user: AuthUser) {
        return this.getMyRestaurantsUseCase.execute({ currentUserId: user.userId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get restaurant by ID' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiOkResponse({ description: 'Restaurant details' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    async getById(@Param('id', ParseUUIDPipe) id: string) {
        return this.getRestaurantByIdUseCase.execute({ restaurantId: id });
    }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update restaurant profile' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiBody({ type: UpdateRestaurantRequestDto })
    @ApiNoContentResponse({ description: 'Updated successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    async update(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateRestaurantRequestDto,
    ): Promise<void> {
        return this.updateRestaurantUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
            name: dto.name,
            description: dto.description,
            logoUrl: dto.logoUrl,
            coverUrl: dto.coverUrl,
            city: dto.city,
            addressText: dto.addressText,
            phone: dto.phone,
            email: dto.email,
            minOrderAmount: dto.minOrderAmount,
            deliveryFee: dto.deliveryFee,
        });
    }

    @Post(':id/submit-for-verification')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Submit restaurant for verification' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiNoContentResponse({ description: 'Submitted successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async submitForVerification(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.submitForVerificationUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
        });
    }

    @Post(':id/pause')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Pause restaurant (stop accepting orders)' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiNoContentResponse({ description: 'Paused successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    @ApiConflictResponse({ description: 'Invalid status transition — restaurant must be ACTIVE' })
    async pause(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.pauseRestaurantUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
        });
    }

    @Post(':id/activate')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Activate restaurant (resume accepting orders)' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiNoContentResponse({ description: 'Activated successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    @ApiConflictResponse({ description: 'Invalid status transition — restaurant must be PAUSED and VERIFIED' })
    async activate(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<void> {
        return this.activateRestaurantUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
        });
    }

    @Post(':id/staff')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add staff member to restaurant' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiBody({ type: AddRestaurantStaffRequestDto })
    @ApiCreatedResponse({ description: 'Staff member added' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant or target user not found' })
    @ApiConflictResponse({ description: 'User is already a staff member' })
    async addStaff(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AddRestaurantStaffRequestDto,
    ): Promise<void> {
        return this.addRestaurantStaffUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
            targetUserId: dto.userId,
            role: dto.role,
        });
    }

    @Delete(':id/staff/:staffId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove staff member from restaurant' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiParam({ name: 'staffId', description: 'Staff record UUID' })
    @ApiNoContentResponse({ description: 'Staff member removed' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant or staff record not found' })
    @ApiConflictResponse({ description: 'Cannot remove the owner' })
    async removeStaff(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Param('staffId', ParseUUIDPipe) staffId: string,
    ): Promise<void> {
        return this.removeRestaurantStaffUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
            staffId,
        });
    }

    @Put(':id/working-hours')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Replace all working hours for restaurant' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiBody({ type: UpdateRestaurantWorkingHoursRequestDto })
    @ApiNoContentResponse({ description: 'Working hours updated' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    async updateWorkingHours(
        @CurrentUser() user: AuthUser,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateRestaurantWorkingHoursRequestDto,
    ): Promise<void> {
        return this.updateWorkingHoursUseCase.execute({
            restaurantId: id,
            currentUserId: user.userId,
            hours: dto.hours.map((h) => ({
                dayOfWeek: h.dayOfWeek,
                opensAt: h.opensAt ?? null,
                closesAt: h.closesAt ?? null,
                isClosed: h.isClosed,
            })),
        });
    }
}
