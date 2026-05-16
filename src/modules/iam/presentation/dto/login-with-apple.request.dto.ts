import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEmail, IsOptional, IsString} from "class-validator";

export class LoginWithAppleRequestDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email returned by Apple authentication',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        example: 'Safari on iPhone',
        description: 'Optional device name for session tracking',
    })
    @IsOptional()
    @IsString()
    deviceName?: string;
}
