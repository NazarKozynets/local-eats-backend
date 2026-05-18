import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateRestaurantRequestDto {
    @ApiProperty({ example: 'Pizza Palace', description: 'Restaurant name (max 150 chars)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiPropertyOptional({ example: 'Authentic Italian pizza since 1990', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/logos/pizza-palace.jpg', nullable: true })
    @IsOptional()
    @IsUrl()
    logoUrl?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/covers/pizza-palace.jpg', nullable: true })
    @IsOptional()
    @IsUrl()
    coverUrl?: string | null;

    @ApiProperty({ example: 'Kyiv' })
    @IsString()
    @IsNotEmpty()
    city!: string;

    @ApiProperty({ example: 'Khreshchatyk St, 1' })
    @IsString()
    @IsNotEmpty()
    addressText!: string;

    @ApiPropertyOptional({ example: '+380501234567', nullable: true })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string | null;

    @ApiPropertyOptional({ example: 'hello@pizzapalace.com', nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string | null;

    @ApiPropertyOptional({ example: 150, description: 'Minimum order amount in cents/units' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderAmount?: number;

    @ApiPropertyOptional({ example: 50, description: 'Delivery fee in cents/units' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    deliveryFee?: number;
}
