import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

export class UpdateMenuItemRequestDto {
    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', nullable: true })
    @IsOptional()
    @ValidateIf((o) => o.categoryId !== null)
    @IsUUID()
    categoryId?: string | null;

    @ApiPropertyOptional({ example: 'Margherita Pizza' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name?: string;

    @ApiPropertyOptional({ example: 'Classic tomato and mozzarella', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/pizza.jpg', nullable: true })
    @IsOptional()
    @ValidateIf((o) => o.imageUrl !== null)
    @IsUrl()
    imageUrl?: string | null;

    @ApiPropertyOptional({ example: 14.99, description: 'Price (must be >= 0)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ example: 350, nullable: true })
    @IsOptional()
    @ValidateIf((o) => o.weightGrams !== null)
    @IsInt()
    @Min(1)
    weightGrams?: number | null;

    @ApiPropertyOptional({ example: 15, nullable: true })
    @IsOptional()
    @ValidateIf((o) => o.estimatedCookTime !== null)
    @IsInt()
    @Min(1)
    estimatedCookTime?: number | null;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;
}
