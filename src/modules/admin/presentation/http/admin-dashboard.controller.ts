import { Controller, Get, UseGuards } from '@nestjs/common';
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
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard/get-admin-dashboard.use-case';
import { AdminDashboardResponseDto } from './dto/admin-response.dtos';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Dashboard')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminDashboardController {
    constructor(
        private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    @ApiOkResponse({ type: AdminDashboardResponseDto })
    async getDashboard(): Promise<AdminDashboardResponseDto> {
        const result = await this.getAdminDashboardUseCase.execute();
        return AdminDashboardResponseDto.from(result);
    }
}
