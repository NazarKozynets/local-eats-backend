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
import { GetAdminUsersUseCase } from '../../application/use-cases/get-admin-users/get-admin-users.use-case';
import { AdminUsersQueryDto } from './dto/admin-list-query.dto';
import { AdminUserResponseDto } from './dto/admin-response.dtos';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminUsersController {
    constructor(
        private readonly getAdminUsersUseCase: GetAdminUsersUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all users with optional filters' })
    @ApiOkResponse({ type: [AdminUserResponseDto] })
    async getUsers(@Query() query: AdminUsersQueryDto): Promise<AdminUserResponseDto[]> {
        const users = await this.getAdminUsersUseCase.execute(query);
        return users.map(AdminUserResponseDto.from);
    }
}
