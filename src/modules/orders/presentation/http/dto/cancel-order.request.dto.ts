import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderRequestDto {
    @ApiPropertyOptional({ description: 'Optional cancellation reason' })
    @IsOptional()
    @IsString()
    reason?: string | null;
}
