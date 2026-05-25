import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateReviewRequestDto {
    @ApiPropertyOptional({ description: 'New rating from 1 to 5', minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ description: 'New comment, or null to remove', maxLength: 1000 })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string | null;
}
