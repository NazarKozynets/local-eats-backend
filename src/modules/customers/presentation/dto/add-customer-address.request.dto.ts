import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddCustomerAddressRequestDto {
    @ApiPropertyOptional({
        example: 'Home',
        description: 'Human-readable label for this address',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    label?: string | null;

    @ApiProperty({ example: 'Kyiv' })
    @IsString()
    @MaxLength(100)
    city: string;

    @ApiProperty({ example: 'Khreshchatyk Street' })
    @IsString()
    @MaxLength(255)
    street: string;

    @ApiProperty({ example: '1' })
    @IsString()
    @MaxLength(20)
    building: string;

    @ApiPropertyOptional({ example: '42' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    apartment?: string | null;

    @ApiPropertyOptional({ example: '2' })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    entrance?: string | null;

    @ApiPropertyOptional({ example: '5' })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    floor?: string | null;

    @ApiPropertyOptional({ example: 'Ring the doorbell twice' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string | null;

    @ApiPropertyOptional({
        example: false,
        description: 'Set this address as the default delivery address',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
