import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectRestaurantRequestDto {
    @ApiProperty({ example: 'Incomplete menu information', description: 'Reason for rejecting the restaurant verification request' })
    @IsString()
    @MinLength(5)
    @MaxLength(500)
    reason!: string;
}
