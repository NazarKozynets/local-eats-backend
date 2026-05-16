import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class RefreshTokenRequestDto {
    @ApiProperty({
        example: 'jwt-refresh-token',
        description: 'Refresh token for the active session',
    })
    @IsString()
    refreshToken: string;

    @ApiPropertyOptional({
        example: 'Chrome on Windows',
        description: 'Optional device name for session tracking',
    })
    @IsOptional()
    @IsString()
    deviceName?: string;
}
