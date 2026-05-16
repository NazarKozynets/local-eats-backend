import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class RequestPasswordResetRequestDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email or phone number for the account requesting password reset',
    })
    @IsString()
    identifier: string;
}
