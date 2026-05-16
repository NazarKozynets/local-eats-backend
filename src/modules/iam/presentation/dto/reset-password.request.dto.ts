import {ApiProperty} from "@nestjs/swagger";
import {IsString, IsUUID, MinLength} from "class-validator";

export class ResetPasswordRequestDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'IAM user id whose password should be reset',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: 'NewStrongPassword123',
        description: 'New account password',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
