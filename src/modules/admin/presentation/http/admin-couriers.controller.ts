import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { GetAdminCouriersUseCase } from '../../application/use-cases/get-admin-couriers/get-admin-couriers.use-case';
import { AdminCouriersQueryDto } from './dto/admin-list-query.dto';
import { AdminCourierResponseDto } from './dto/admin-response.dtos';

@Controller('admin/couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Couriers')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminCouriersListController {
    constructor(
        private readonly getAdminCouriersUseCase: GetAdminCouriersUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all couriers with optional filters' })
    @ApiOkResponse({ type: [AdminCourierResponseDto] })
    async getCouriers(@Query() query: AdminCouriersQueryDto): Promise<AdminCourierResponseDto[]> {
        const couriers = await this.getAdminCouriersUseCase.execute(query);
        return couriers.map(AdminCourierResponseDto.from);
    }
}
