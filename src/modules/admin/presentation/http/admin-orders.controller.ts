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
import { GetAdminOrdersUseCase } from '../../application/use-cases/get-admin-orders/get-admin-orders.use-case';
import { AdminOrdersQueryDto } from './dto/admin-list-query.dto';
import { AdminOrderResponseDto } from './dto/admin-response.dtos';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Orders')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminOrdersController {
    constructor(
        private readonly getAdminOrdersUseCase: GetAdminOrdersUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all orders with optional filters' })
    @ApiOkResponse({ type: [AdminOrderResponseDto] })
    async getOrders(@Query() query: AdminOrdersQueryDto): Promise<AdminOrderResponseDto[]> {
        const orders = await this.getAdminOrdersUseCase.execute(query);
        return orders.map(AdminOrderResponseDto.from);
    }
}
