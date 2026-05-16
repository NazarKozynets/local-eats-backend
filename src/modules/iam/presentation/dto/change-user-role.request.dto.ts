import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";
import {UserRole} from "../../domain/enums/user-role.enum";

export class ChangeUserRoleRequestDto {
    @ApiProperty({
        enum: UserRole,
        example: UserRole.PROVIDER,
        description: 'New IAM role for the user',
    })
    @IsEnum(UserRole)
    role: UserRole;
}
