import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class LogoutRequestDto {
    @ApiProperty({
        example: 'jwt-refresh-token',
        description: 'Refresh token identifying the session to revoke',
    })
    @IsString()
    refreshToken: string;
}
