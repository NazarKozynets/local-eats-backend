import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class VerifyEmailRequestDto {
    @ApiPropertyOptional({
        example: '123456',
        description: 'Optional email verification code. Current use case verifies the authenticated user.',
    })
    @IsOptional()
    @IsString()
    code?: string;
}
