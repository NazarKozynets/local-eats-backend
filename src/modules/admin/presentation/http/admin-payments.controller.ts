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
import { GetAdminPaymentsUseCase } from '../../application/use-cases/get-admin-payments/get-admin-payments.use-case';
import { AdminPaymentsQueryDto } from './dto/admin-list-query.dto';
import { AdminPaymentResponseDto } from './dto/admin-response.dtos';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Payments Read')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminPaymentsListController {
    constructor(
        private readonly getAdminPaymentsUseCase: GetAdminPaymentsUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all payments with optional filters' })
    @ApiOkResponse({ type: [AdminPaymentResponseDto] })
    async getPayments(@Query() query: AdminPaymentsQueryDto): Promise<AdminPaymentResponseDto[]> {
        const payments = await this.getAdminPaymentsUseCase.execute(query);
        return payments.map(AdminPaymentResponseDto.from);
    }
}
