import {ApiProperty} from "@nestjs/swagger";
import {IsString, MinLength} from "class-validator";

export class ChangePasswordRequestDto {
    @ApiProperty({
        example: 'OldPassword123',
        description: 'Current account password',
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        example: 'NewStrongPassword123',
        description: 'New account password',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
