import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
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
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { GetAdminDeliveryProblemsUseCase } from '../../application/use-cases/get-admin-delivery-problems/get-admin-delivery-problems.use-case';
import { ResolveDeliveryProblemUseCase } from '../../application/use-cases/resolve-delivery-problem/resolve-delivery-problem.use-case';
import { AdminDeliveryProblemsQueryDto } from './dto/admin-list-query.dto';
import { AdminDeliveryProblemResponseDto } from './dto/admin-response.dtos';

@Controller('admin/delivery-problems')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Delivery Problems')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminDeliveryProblemsController {
    constructor(
        private readonly getAdminDeliveryProblemsUseCase: GetAdminDeliveryProblemsUseCase,
        private readonly resolveDeliveryProblemUseCase: ResolveDeliveryProblemUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all delivery problems with optional filters' })
    @ApiOkResponse({ type: [AdminDeliveryProblemResponseDto] })
    async getDeliveryProblems(
        @Query() query: AdminDeliveryProblemsQueryDto,
    ): Promise<AdminDeliveryProblemResponseDto[]> {
        const problems = await this.getAdminDeliveryProblemsUseCase.execute(query);
        return problems.map(AdminDeliveryProblemResponseDto.from);
    }

    @Post(':problemId/resolve')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark a delivery problem as resolved' })
    @ApiParam({ name: 'problemId', description: 'Delivery problem UUID' })
    @ApiNoContentResponse({ description: 'Delivery problem resolved' })
    @ApiNotFoundResponse({ description: 'Delivery problem not found' })
    @ApiConflictResponse({ description: 'Delivery problem is already resolved' })
    async resolve(@Param('problemId', ParseUUIDPipe) problemId: string): Promise<void> {
        return this.resolveDeliveryProblemUseCase.execute({ problemId });
    }
}
