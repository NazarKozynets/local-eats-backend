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
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreateCustomerProfileUseCase } from '../../application/use-cases/create-customer-profile/create-customer-profile.use-case';
import { GetMyCustomerProfileUseCase } from '../../application/use-cases/get-my-customer-profile/get-my-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from '../../application/use-cases/update-customer-profile/update-customer-profile.use-case';
import { CreateCustomerProfileCommand } from '../../application/use-cases/create-customer-profile/create-customer-profile.command';
import { GetMyCustomerProfileCommand } from '../../application/use-cases/get-my-customer-profile/get-my-customer-profile.command';
import { UpdateCustomerProfileCommand } from '../../application/use-cases/update-customer-profile/update-customer-profile.command';
import { UpdateCustomerProfileRequestDto } from '../dto/update-customer-profile.request.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiTags('Customers')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class CustomerProfileController {
    constructor(
        private readonly createCustomerProfileUseCase: CreateCustomerProfileUseCase,
        private readonly getMyCustomerProfileUseCase: GetMyCustomerProfileUseCase,
        private readonly updateCustomerProfileUseCase: UpdateCustomerProfileUseCase,
    ) {}

    @Post('me')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create customer profile' })
    @ApiCreatedResponse({ description: 'Profile created successfully' })
    @ApiConflictResponse({ description: 'Profile already exists' })
    @ApiForbiddenResponse({ description: 'Account is not active or not a customer role' })
    @ApiNotFoundResponse({ description: 'IAM account not found' })
    async createProfile(@CurrentUser() user: AuthUser): Promise<void> {
        return this.createCustomerProfileUseCase.execute(
            CreateCustomerProfileCommand.create({ userId: user.userId }),
        );
    }

    @Get('me')
    @ApiOperation({ summary: 'Get my customer profile' })
    @ApiOkResponse({ description: 'Customer profile data' })
    @ApiNotFoundResponse({ description: 'Customer profile not found' })
    async getMyProfile(@CurrentUser() user: AuthUser) {
        return this.getMyCustomerProfileUseCase.execute(
            GetMyCustomerProfileCommand.create({ userId: user.userId }),
        );
    }

    @Patch('me')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update my customer profile' })
    @ApiBody({ type: UpdateCustomerProfileRequestDto })
    @ApiOkResponse({ description: 'Profile updated successfully' })
    @ApiNotFoundResponse({ description: 'Customer profile not found' })
    async updateProfile(
        @CurrentUser() user: AuthUser,
        @Body() dto: UpdateCustomerProfileRequestDto,
    ): Promise<void> {
        return this.updateCustomerProfileUseCase.execute(
            UpdateCustomerProfileCommand.create({
                userId: user.userId,
                displayName: dto.displayName,
                avatarUrl: dto.avatarUrl,
            }),
        );
    }
}
