import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewTarget } from '../../../domain/enums/review-target.enum';
import type { Review } from '../../../domain/entities/review.entity';

export class ReviewResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orderId!: string;

    @ApiProperty()
    reviewerUserId!: string;

    @ApiProperty()
    customerId!: string;

    @ApiProperty({ enum: ReviewTarget })
    target!: ReviewTarget;

    @ApiPropertyOptional()
    restaurantId!: string | null;

    @ApiPropertyOptional()
    courierId!: string | null;

    @ApiProperty({ minimum: 1, maximum: 5 })
    rating!: number;

    @ApiPropertyOptional()
    comment!: string | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    static from(review: Review): ReviewResponseDto {
        const dto = new ReviewResponseDto();
        dto.id = review.id.value;
        dto.orderId = review.orderId.value;
        dto.reviewerUserId = review.reviewerUserId.value;
        dto.customerId = review.customerId.value;
        dto.target = review.target;
        dto.restaurantId = review.restaurantId?.value ?? null;
        dto.courierId = review.courierId?.value ?? null;
        dto.rating = review.rating;
        dto.comment = review.comment;
        dto.createdAt = review.createdAt;
        dto.updatedAt = review.updatedAt;
        return dto;
    }
}
