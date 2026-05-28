import {
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiForbiddenResponse,
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
import { ResolveDeliveryProblemUseCase } from '../../application/use-cases/resolve-delivery-problem/resolve-delivery-problem.use-case';
import { ResolveDeliveryProblemCommand } from '../../application/use-cases/resolve-delivery-problem/resolve-delivery-problem.command';
import { DeliveryProblemReportResponseDto } from './dto/delivery-problem-report.response.dto';

@ApiTags('Admin — Deliveries')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse()
@ApiForbiddenResponse({ description: 'Requires ADMIN role' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/deliveries')
export class AdminDeliveriesController {
    constructor(private readonly resolveProblemUseCase: ResolveDeliveryProblemUseCase) {}

    @Patch('problems/:problemReportId/resolve')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resolve a delivery problem report' })
    @ApiParam({ name: 'problemReportId', description: 'Problem report UUID' })
    @ApiOkResponse({ type: DeliveryProblemReportResponseDto })
    @ApiNotFoundResponse()
    @ApiConflictResponse({ description: 'Problem already resolved' })
    async resolveProblem(
        @CurrentUser() user: AuthUser,
        @Param('problemReportId', ParseUUIDPipe) problemReportId: string,
    ): Promise<DeliveryProblemReportResponseDto> {
        const report = await this.resolveProblemUseCase.execute(
            ResolveDeliveryProblemCommand.create({ adminUserId: user.userId, problemReportId }),
        );
        return DeliveryProblemReportResponseDto.from(report);
    }
}
