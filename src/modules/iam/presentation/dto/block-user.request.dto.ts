import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsDateString, IsOptional, IsString} from "class-validator";

export class BlockUserRequestDto {
    @ApiProperty({
        example: 'Suspicious activity detected',
        description: 'Reason for blocking the user account',
    })
    @IsString()
    reason: string;

    @ApiPropertyOptional({
        example: '2026-06-01T00:00:00.000Z',
        description: 'Optional time when the user may be unblocked',
        nullable: true,
    })
    @IsOptional()
    @IsDateString()
    blockedUntil?: string | null;
}
