import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreateRestaurantReviewUseCase } from '../../application/use-cases/create-restaurant-review/create-restaurant-review.use-case';
import { CreateCourierReviewUseCase } from '../../application/use-cases/create-courier-review/create-courier-review.use-case';
import { GetMyReviewsUseCase } from '../../application/use-cases/get-my-reviews/get-my-reviews.use-case';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review/update-review.use-case';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review/delete-review.use-case';
import { CreateRestaurantReviewRequestDto } from './dto/create-restaurant-review.request.dto';
import { CreateCourierReviewRequestDto } from './dto/create-courier-review.request.dto';
import { UpdateReviewRequestDto } from './dto/update-review.request.dto';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';
import { ReviewResponseDto } from './dto/review.response.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class ReviewsController {
    constructor(
        private readonly createRestaurantReviewUseCase: CreateRestaurantReviewUseCase,
        private readonly createCourierReviewUseCase: CreateCourierReviewUseCase,
        private readonly getMyReviewsUseCase: GetMyReviewsUseCase,
        private readonly updateReviewUseCase: UpdateReviewUseCase,
        private readonly deleteReviewUseCase: DeleteReviewUseCase,
    ) {}

    @Post('restaurant')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a restaurant review for a delivered order' })
    @ApiBody({ type: CreateRestaurantReviewRequestDto })
    @ApiCreatedResponse({ description: 'Restaurant review created' })
    @ApiConflictResponse({ description: 'Order not delivered or review already exists' })
    @ApiForbiddenResponse({ description: 'Not the customer of this order' })
    async createRestaurantReview(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateRestaurantReviewRequestDto,
    ): Promise<void> {
        return this.createRestaurantReviewUseCase.execute({
            currentUserId: user.userId,
            orderId: dto.orderId,
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    @Post('courier')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a courier review for a delivered order' })
    @ApiBody({ type: CreateCourierReviewRequestDto })
    @ApiCreatedResponse({ description: 'Courier review created' })
    @ApiConflictResponse({ description: 'Order not delivered, no courier, or review already exists' })
    @ApiForbiddenResponse({ description: 'Not the customer of this order' })
    async createCourierReview(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateCourierReviewRequestDto,
    ): Promise<void> {
        return this.createCourierReviewUseCase.execute({
            currentUserId: user.userId,
            orderId: dto.orderId,
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my reviews' })
    @ApiOkResponse({ type: [ReviewResponseDto] })
    async getMyReviews(
        @CurrentUser() user: AuthUser,
        @Query() query: GetReviewsQueryDto,
    ): Promise<ReviewResponseDto[]> {
        const reviews = await this.getMyReviewsUseCase.execute({
            currentUserId: user.userId,
            page: query.page,
            limit: query.limit,
        });
        return reviews.map(ReviewResponseDto.from);
    }

    @Patch(':reviewId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update a review' })
    @ApiBody({ type: UpdateReviewRequestDto })
    @ApiNoContentResponse({ description: 'Review updated' })
    @ApiNotFoundResponse({ description: 'Review not found' })
    @ApiForbiddenResponse({ description: 'Not the owner of this review' })
    async updateReview(
        @CurrentUser() user: AuthUser,
        @Param('reviewId', ParseUUIDPipe) reviewId: string,
        @Body() dto: UpdateReviewRequestDto,
    ): Promise<void> {
        return this.updateReviewUseCase.execute({
            currentUserId: user.userId,
            reviewId,
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    @Delete(':reviewId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a review' })
    @ApiNoContentResponse({ description: 'Review deleted' })
    @ApiNotFoundResponse({ description: 'Review not found' })
    @ApiForbiddenResponse({ description: 'Not the owner of this review' })
    async deleteReview(
        @CurrentUser() user: AuthUser,
        @Param('reviewId', ParseUUIDPipe) reviewId: string,
    ): Promise<void> {
        return this.deleteReviewUseCase.execute({
            currentUserId: user.userId,
            reviewId,
        });
    }
}
