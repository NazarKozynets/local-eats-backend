import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class UpdateRestaurantRequestDto {
    @ApiPropertyOptional({ example: 'Pizza Palace', nullable: false })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(150)
    name?: string;

    @ApiPropertyOptional({ example: 'Authentic Italian pizza since 1990', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsUrl()
    logoUrl?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsUrl()
    coverUrl?: string | null;

    @ApiPropertyOptional({ example: 'Kyiv' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    city?: string;

    @ApiPropertyOptional({ example: 'Khreshchatyk St, 1' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    addressText?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string | null;

    @ApiPropertyOptional({ example: 150 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderAmount?: number;

    @ApiPropertyOptional({ example: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    deliveryFee?: number;
}
