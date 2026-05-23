import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class MarkPaymentPaidRequestDto {
    @ApiPropertyOptional({ description: 'Provider payment ID' })
    @IsOptional()
    @IsString()
    providerPaymentId?: string | null;

    @ApiPropertyOptional({ description: 'Timestamp when payment was confirmed' })
    @IsOptional()
    @IsDateString()
    paidAt?: string | null;
}
