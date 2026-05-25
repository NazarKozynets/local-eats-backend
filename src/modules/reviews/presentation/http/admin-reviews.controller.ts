import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
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
import { AdminDeleteReviewUseCase } from '../../application/use-cases/admin-delete-review/admin-delete-review.use-case';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Reviews Admin')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminReviewsController {
    constructor(
        private readonly adminDeleteReviewUseCase: AdminDeleteReviewUseCase,
    ) {}

    @Delete(':reviewId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete any review (admin override)' })
    @ApiParam({ name: 'reviewId', description: 'Review UUID' })
    @ApiNoContentResponse({ description: 'Review deleted' })
    @ApiNotFoundResponse({ description: 'Review not found' })
    async deleteReview(
        @Param('reviewId', ParseUUIDPipe) reviewId: string,
    ): Promise<void> {
        return this.adminDeleteReviewUseCase.execute({ reviewId });
    }
}
