import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMenuCategoryRequestDto {
    @ApiProperty({ example: 'Pizza', description: 'Category name (max 100 chars)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({ example: 1, description: 'Display position (0-based)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}
