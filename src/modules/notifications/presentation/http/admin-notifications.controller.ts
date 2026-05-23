import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification/create-notification.use-case';
import { CreateNotificationCommand } from '../../application/use-cases/create-notification/create-notification.command';
import { CreateNotificationRequestDto } from './dto/create-notification.request.dto';

@ApiTags('Admin — Notifications')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Insufficient permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/notifications')
export class AdminNotificationsController {
    constructor(private readonly createNotificationUseCase: CreateNotificationUseCase) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a notification for a user (admin)' })
    @ApiCreatedResponse({ description: 'Notification created' })
    @ApiBadRequestResponse({ description: 'Invalid request data' })
    async create(@Body() dto: CreateNotificationRequestDto): Promise<void> {
        return this.createNotificationUseCase.execute(
            CreateNotificationCommand.create({
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                body: dto.body,
                data: dto.data,
            }),
        );
    }
}
