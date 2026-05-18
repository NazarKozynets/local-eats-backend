import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { ApproveRestaurantUseCase } from '../../application/use-cases/approve-restaurant/approve-restaurant.use-case';
import { RejectRestaurantUseCase } from '../../application/use-cases/reject-restaurant/reject-restaurant.use-case';
import { BlockRestaurantUseCase } from '../../application/use-cases/block-restaurant/block-restaurant.use-case';
import { RejectRestaurantRequestDto } from '../dto/reject-restaurant.request.dto';

@Controller('admin/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Restaurants Admin')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminRestaurantsController {
    constructor(
        private readonly approveRestaurantUseCase: ApproveRestaurantUseCase,
        private readonly rejectRestaurantUseCase: RejectRestaurantUseCase,
        private readonly blockRestaurantUseCase: BlockRestaurantUseCase,
    ) {}

    @Post(':id/approve')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Approve restaurant verification request' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiNoContentResponse({ description: 'Restaurant approved' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    @ApiConflictResponse({ description: 'Restaurant is not in PENDING_VERIFICATION status' })
    async approve(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.approveRestaurantUseCase.execute({ restaurantId: id });
    }

    @Post(':id/reject')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Reject restaurant verification request' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiBody({ type: RejectRestaurantRequestDto })
    @ApiNoContentResponse({ description: 'Restaurant rejected' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    @ApiConflictResponse({ description: 'Restaurant is not in PENDING_VERIFICATION status' })
    async reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: RejectRestaurantRequestDto,
    ): Promise<void> {
        return this.rejectRestaurantUseCase.execute({ restaurantId: id, reason: dto.reason });
    }

    @Post(':id/block')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Block restaurant' })
    @ApiParam({ name: 'id', description: 'Restaurant UUID' })
    @ApiNoContentResponse({ description: 'Restaurant blocked' })
    @ApiNotFoundResponse({ description: 'Restaurant not found' })
    async block(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.blockRestaurantUseCase.execute({ restaurantId: id });
    }
}
