import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { GetRestaurantReviewsUseCase } from '../../application/use-cases/get-restaurant-reviews/get-restaurant-reviews.use-case';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';
import { ReviewResponseDto } from './dto/review.response.dto';

@Controller('restaurants/:restaurantId/reviews')
@ApiTags('Reviews')
export class RestaurantReviewsController {
    constructor(
        private readonly getRestaurantReviewsUseCase: GetRestaurantReviewsUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get reviews for a restaurant' })
    @ApiOkResponse({ type: [ReviewResponseDto] })
    async getRestaurantReviews(
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
        @Query() query: GetReviewsQueryDto,
    ): Promise<ReviewResponseDto[]> {
        const reviews = await this.getRestaurantReviewsUseCase.execute({
            restaurantId,
            page: query.page,
            limit: query.limit,
        });
        return reviews.map(ReviewResponseDto.from);
    }
}
