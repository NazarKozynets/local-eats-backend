import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectCourierRequestDto {
    @ApiProperty({ example: 'Missing required documents' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason!: string;
}
