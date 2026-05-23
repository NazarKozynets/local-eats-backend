import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { GetMyNotificationsUseCase } from '../../application/use-cases/get-my-notifications/get-my-notifications.use-case';
import { GetMyNotificationsCommand } from '../../application/use-cases/get-my-notifications/get-my-notifications.command';
import { GetMyUnreadNotificationsCountUseCase } from '../../application/use-cases/get-my-unread-notifications-count/get-my-unread-notifications-count.use-case';
import { GetMyUnreadNotificationsCountCommand } from '../../application/use-cases/get-my-unread-notifications-count/get-my-unread-notifications-count.command';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read/mark-notification-as-read.use-case';
import { MarkNotificationAsReadCommand } from '../../application/use-cases/mark-notification-as-read/mark-notification-as-read.command';
import { MarkAllNotificationsAsReadUseCase } from '../../application/use-cases/mark-all-notifications-as-read/mark-all-notifications-as-read.use-case';
import { MarkAllNotificationsAsReadCommand } from '../../application/use-cases/mark-all-notifications-as-read/mark-all-notifications-as-read.command';
import { NotificationResponseDto } from './dto/notification.response.dto';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { UnreadCountResponseDto } from './dto/unread-count.response.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly getMyNotificationsUseCase: GetMyNotificationsUseCase,
        private readonly getMyUnreadCountUseCase: GetMyUnreadNotificationsCountUseCase,
        private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
        private readonly markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiOkResponse({ description: 'List of notifications', type: [NotificationResponseDto] })
    async getMyNotifications(
        @CurrentUser() user: AuthUser,
        @Query() query: GetNotificationsQueryDto,
    ): Promise<NotificationResponseDto[]> {
        const notifications = await this.getMyNotificationsUseCase.execute(
            GetMyNotificationsCommand.create({
                currentUserId: user.userId,
                page: query.page,
                limit: query.limit,
                unreadOnly: query.unreadOnly,
            }),
        );

        return notifications.map(NotificationResponseDto.from);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get my unread notifications count' })
    @ApiOkResponse({ description: 'Unread count', type: UnreadCountResponseDto })
    async getUnreadCount(@CurrentUser() user: AuthUser): Promise<UnreadCountResponseDto> {
        return this.getMyUnreadCountUseCase.execute(
            GetMyUnreadNotificationsCountCommand.create({ currentUserId: user.userId }),
        );
    }

    @Patch('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all my notifications as read' })
    @ApiOkResponse({ description: 'Number of notifications marked as read', type: UnreadCountResponseDto })
    async markAllAsRead(@CurrentUser() user: AuthUser): Promise<UnreadCountResponseDto> {
        return this.markAllAsReadUseCase.execute(
            MarkAllNotificationsAsReadCommand.create({ currentUserId: user.userId }),
        );
    }

    @Patch(':notificationId/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiParam({ name: 'notificationId', description: 'Notification UUID' })
    @ApiNoContentResponse({ description: 'Notification marked as read' })
    @ApiNotFoundResponse({ description: 'Notification not found' })
    @ApiForbiddenResponse({ description: 'Access denied' })
    async markAsRead(
        @CurrentUser() user: AuthUser,
        @Param('notificationId', ParseUUIDPipe) notificationId: string,
    ): Promise<void> {
        return this.markAsReadUseCase.execute(
            MarkNotificationAsReadCommand.create({
                currentUserId: user.userId,
                notificationId,
            }),
        );
    }
}
