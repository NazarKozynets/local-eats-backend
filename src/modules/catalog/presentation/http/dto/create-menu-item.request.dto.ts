import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
} from 'class-validator';

export class CreateMenuItemRequestDto {
    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', nullable: true })
    @IsOptional()
    @IsUUID()
    categoryId?: string | null;

    @ApiProperty({ example: 'Margherita Pizza', description: 'Item name (max 200 chars)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name!: string;

    @ApiPropertyOptional({ example: 'Classic tomato and mozzarella', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/pizza.jpg', nullable: true })
    @IsOptional()
    @IsUrl()
    imageUrl?: string | null;

    @ApiProperty({ example: 14.99, description: 'Price (must be >= 0)' })
    @IsNumber()
    @Min(0)
    price!: number;

    @ApiPropertyOptional({ example: 350, description: 'Weight in grams (must be > 0)', nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    weightGrams?: number | null;

    @ApiPropertyOptional({ example: 15, description: 'Estimated cook time in minutes (must be > 0)', nullable: true })
    @IsOptional()
    @IsInt()
    @Min(1)
    estimatedCookTime?: number | null;

    @ApiPropertyOptional({ example: false, description: 'Mark as popular item' })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;
}
