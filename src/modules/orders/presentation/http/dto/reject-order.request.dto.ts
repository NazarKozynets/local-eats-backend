import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectOrderRequestDto {
    @ApiProperty({ description: 'Reason for rejection (required)' })
    @IsString()
    @MinLength(1)
    reason!: string;
}
