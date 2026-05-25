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
import { GetAdminReviewsUseCase } from '../../application/use-cases/get-admin-reviews/get-admin-reviews.use-case';
import { AdminReviewsQueryDto } from './dto/admin-list-query.dto';
import { AdminReviewResponseDto } from './dto/admin-response.dtos';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Reviews')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminReviewsListController {
    constructor(
        private readonly getAdminReviewsUseCase: GetAdminReviewsUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all reviews with optional filters' })
    @ApiOkResponse({ type: [AdminReviewResponseDto] })
    async getReviews(@Query() query: AdminReviewsQueryDto): Promise<AdminReviewResponseDto[]> {
        const reviews = await this.getAdminReviewsUseCase.execute(query);
        return reviews.map(AdminReviewResponseDto.from);
    }
}
