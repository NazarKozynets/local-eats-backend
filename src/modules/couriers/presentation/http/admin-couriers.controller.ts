import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
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
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { ApproveCourierUseCase } from '../../application/use-cases/approve-courier/approve-courier.use-case';
import { RejectCourierUseCase } from '../../application/use-cases/reject-courier/reject-courier.use-case';
import { BlockCourierUseCase } from '../../application/use-cases/block-courier/block-courier.use-case';
import { GetAvailableCouriersUseCase } from '../../application/use-cases/get-available-couriers/get-available-couriers.use-case';
import { RejectCourierRequestDto } from './dto/reject-courier.request.dto';
import { BlockCourierRequestDto } from './dto/block-courier.request.dto';
import { AvailableCourierResponseDto } from './dto/available-courier.response.dto';

@Controller('admin/couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Couriers Admin')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminCouriersController {
    constructor(
        private readonly approveCourierUseCase: ApproveCourierUseCase,
        private readonly rejectCourierUseCase: RejectCourierUseCase,
        private readonly blockCourierUseCase: BlockCourierUseCase,
        private readonly getAvailableCouriersUseCase: GetAvailableCouriersUseCase,
    ) {}

    @Get('available')
    @ApiOperation({ summary: 'Get all currently available couriers' })
    @ApiOkResponse({ type: [AvailableCourierResponseDto] })
    async getAvailable(): Promise<AvailableCourierResponseDto[]> {
        return this.getAvailableCouriersUseCase.execute();
    }

    @Patch(':courierProfileId/approve')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Approve courier verification request' })
    @ApiParam({ name: 'courierProfileId', description: 'Courier profile UUID' })
    @ApiNoContentResponse({ description: 'Courier approved' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Courier verification status must be PENDING' })
    async approve(
        @CurrentUser() user: AuthUser,
        @Param('courierProfileId', ParseUUIDPipe) courierProfileId: string,
    ): Promise<void> {
        return this.approveCourierUseCase.execute({
            actorUserId: user.userId,
            courierProfileId,
        });
    }

    @Patch(':courierProfileId/reject')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Reject courier verification request' })
    @ApiParam({ name: 'courierProfileId', description: 'Courier profile UUID' })
    @ApiBody({ type: RejectCourierRequestDto })
    @ApiNoContentResponse({ description: 'Courier rejected' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    @ApiConflictResponse({ description: 'Courier verification status must be PENDING' })
    async reject(
        @CurrentUser() user: AuthUser,
        @Param('courierProfileId', ParseUUIDPipe) courierProfileId: string,
        @Body() dto: RejectCourierRequestDto,
    ): Promise<void> {
        return this.rejectCourierUseCase.execute({
            actorUserId: user.userId,
            courierProfileId,
            reason: dto.reason,
        });
    }

    @Patch(':courierProfileId/block')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Block courier' })
    @ApiParam({ name: 'courierProfileId', description: 'Courier profile UUID' })
    @ApiBody({ type: BlockCourierRequestDto })
    @ApiNoContentResponse({ description: 'Courier blocked' })
    @ApiNotFoundResponse({ description: 'Courier profile not found' })
    async block(
        @CurrentUser() user: AuthUser,
        @Param('courierProfileId', ParseUUIDPipe) courierProfileId: string,
    ): Promise<void> {
        return this.blockCourierUseCase.execute({
            actorUserId: user.userId,
            courierProfileId,
        });
    }
}
