import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateRestaurantReviewRequestDto {
    @ApiProperty({ description: 'Order ID', format: 'uuid' })
    @IsUUID()
    orderId!: string;

    @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiPropertyOptional({ description: 'Optional review comment', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string | null;
}
