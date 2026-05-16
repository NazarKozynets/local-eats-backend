import {Body, Controller, Delete, Param, Patch, Post, UseGuards} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {BlockUserUseCase} from "../../application/use-cases/block-user/block-user.use-case";
import {UnblockUserUseCase} from "../../application/use-cases/unblock-user/unblock-user.use-case";
import {ChangeUserRoleUseCase} from "../../application/use-cases/change-user-role/change-user-role.use-case";
import {DeleteUserUseCase} from "../../application/use-cases/delete-user/delete-user.use-case";
import {BlockUserCommand} from "../../application/use-cases/block-user/block-user.command";
import {UnblockUserCommand} from "../../application/use-cases/unblock-user/unblock-user.command";
import {ChangeUserRoleCommand} from "../../application/use-cases/change-user-role/change-user-role.command";
import {DeleteUserCommand} from "../../application/use-cases/delete-user/delete-user.command";
import {UserRole} from "../../domain/enums/user-role.enum";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";
import {BlockUserRequestDto} from "../dto/block-user.request.dto";
import {ChangeUserRoleRequestDto} from "../dto/change-user-role.request.dto";

@Controller('admin/iam')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('IAM Admin')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
})
@ApiForbiddenResponse({
    description: 'User does not have ADMIN role',
})
export class AdminIamController {
    constructor(
        private readonly blockUserUseCase: BlockUserUseCase,
        private readonly unblockUserUseCase: UnblockUserUseCase,
        private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @Post('users/:id/block')
    @ApiOperation({
        summary: 'Block user',
        description: 'Blocks a user account. Requires ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'IAM user id to block',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({type: BlockUserRequestDto})
    @ApiOkResponse({
        description: 'User blocked successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async blockUser(
        @Param('id') userId: string,
        @Body() dto: BlockUserRequestDto,
    ): Promise<void> {
        return this.blockUserUseCase.execute(BlockUserCommand.create({
            userId,
            reason: dto.reason,
            blockedUntil: dto.blockedUntil ? new Date(dto.blockedUntil) : null,
        }));
    }

    @Post('users/:id/unblock')
    @ApiOperation({
        summary: 'Unblock user',
        description: 'Unblocks a user account. Requires ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'IAM user id to unblock',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiOkResponse({
        description: 'User unblocked successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async unblockUser(@Param('id') userId: string): Promise<void> {
        return this.unblockUserUseCase.execute(UnblockUserCommand.create({
            userId,
        }));
    }

    @Patch('users/:id/role')
    @ApiOperation({
        summary: 'Change user role',
        description: 'Changes an IAM user role. Requires ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'IAM user id whose role should be changed',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({type: ChangeUserRoleRequestDto})
    @ApiOkResponse({
        description: 'User role changed successfully',
    })
    @ApiBadRequestResponse({
        description: 'Validation error or invalid request data',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async changeUserRole(
        @Param('id') userId: string,
        @Body() dto: ChangeUserRoleRequestDto,
    ): Promise<void> {
        return this.changeUserRoleUseCase.execute(ChangeUserRoleCommand.create({
            userId,
            role: dto.role,
        }));
    }

    @Delete('users/:id')
    @ApiOperation({
        summary: 'Delete user',
        description: 'Marks an IAM user as deleted. Requires ADMIN role.',
    })
    @ApiParam({
        name: 'id',
        description: 'IAM user id to delete',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiOkResponse({
        description: 'User deleted successfully',
    })
    @ApiNotFoundResponse({
        description: 'User not found',
    })
    async deleteUser(@Param('id') userId: string): Promise<void> {
        return this.deleteUserUseCase.execute(DeleteUserCommand.create({
            userId,
        }));
    }
}
