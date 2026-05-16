import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEmail, IsOptional, IsString, MinLength} from "class-validator";

export class RegisterRequestDto {
    @ApiPropertyOptional({
        example: 'user@example.com',
        description: 'Email address for the IAM user account',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: '+380991112233',
        description: 'Phone number for the IAM user account in international format',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        example: 'StrongPassword123',
        description: 'Password used for password-based login',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}
