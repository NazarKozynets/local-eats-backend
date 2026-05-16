import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerAddressRequestDto {
    @ApiPropertyOptional({ example: 'Work', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    label?: string | null;

    @ApiPropertyOptional({ example: 'Lviv' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @ApiPropertyOptional({ example: 'Svobody Avenue' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    street?: string;

    @ApiPropertyOptional({ example: '3' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    building?: string;

    @ApiPropertyOptional({ example: '10', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    apartment?: string | null;

    @ApiPropertyOptional({ example: '1', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    entrance?: string | null;

    @ApiPropertyOptional({ example: '3', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    floor?: string | null;

    @ApiPropertyOptional({ example: 'Leave at reception', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string | null;
}
