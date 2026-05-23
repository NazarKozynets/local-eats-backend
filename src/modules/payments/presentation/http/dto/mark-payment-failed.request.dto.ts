import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class MarkPaymentFailedRequestDto {
    @ApiProperty({ description: 'Reason for failure' })
    @IsString()
    @MinLength(1)
    reason!: string;
}
