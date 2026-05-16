import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString, MinLength} from "class-validator";

export class LoginWithPasswordRequestDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email or phone number used as login identifier',
    })
    @IsString()
    identifier: string;

    @ApiProperty({
        example: 'StrongPassword123',
        description: 'User password',
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    password: string;

    @ApiPropertyOptional({
        example: 'Chrome on Windows',
        description: 'Optional device name for session tracking',
    })
    @IsOptional()
    @IsString()
    deviceName?: string;
}
