import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { GetCourierReviewsUseCase } from '../../application/use-cases/get-courier-reviews/get-courier-reviews.use-case';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';
import { ReviewResponseDto } from './dto/review.response.dto';

@Controller('couriers/:courierId/reviews')
@ApiTags('Reviews')
export class CourierReviewsController {
    constructor(
        private readonly getCourierReviewsUseCase: GetCourierReviewsUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get reviews for a courier' })
    @ApiOkResponse({ type: [ReviewResponseDto] })
    async getCourierReviews(
        @Param('courierId', ParseUUIDPipe) courierId: string,
        @Query() query: GetReviewsQueryDto,
    ): Promise<ReviewResponseDto[]> {
        const reviews = await this.getCourierReviewsUseCase.execute({
            courierId,
            page: query.page,
            limit: query.limit,
        });
        return reviews.map(ReviewResponseDto.from);
    }
}
