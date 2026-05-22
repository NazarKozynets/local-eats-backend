import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateMenuCategoryRequestDto {
    @ApiPropertyOptional({ example: 'Burgers', description: 'New category name' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: 2, description: 'New display position' })
    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @ApiPropertyOptional({ example: true, description: 'Whether the category is active' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
