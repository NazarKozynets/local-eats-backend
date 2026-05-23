import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefundPaymentRequestDto {
    @ApiPropertyOptional({ description: 'Optional reason for refund' })
    @IsOptional()
    @IsString()
    reason?: string | null;
}
