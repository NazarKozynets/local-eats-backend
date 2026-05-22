import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BlockCourierRequestDto {
    @ApiPropertyOptional({ example: 'Violation of terms of service', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
