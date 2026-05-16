import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEmail, IsOptional, IsString} from "class-validator";

export class LoginWithGoogleRequestDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email returned by Google authentication',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        example: 'Chrome on Windows',
        description: 'Optional device name for session tracking',
    })
    @IsOptional()
    @IsString()
    deviceName?: string;
}
