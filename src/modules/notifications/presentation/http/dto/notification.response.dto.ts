import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../domain/enums/notification-type.enum';

export class NotificationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty({ enum: NotificationType })
    type!: NotificationType;

    @ApiProperty()
    title!: string;

    @ApiProperty()
    body!: string;

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    data!: Record<string, unknown> | null;

    @ApiPropertyOptional()
    readAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    static from(notification: {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        body: string;
        data: Record<string, unknown> | null;
        readAt: Date | null;
        createdAt: Date;
    }): NotificationResponseDto {
        const dto = new NotificationResponseDto();
        dto.id = notification.id;
        dto.userId = notification.userId;
        dto.type = notification.type;
        dto.title = notification.title;
        dto.body = notification.body;
        dto.data = notification.data;
        dto.readAt = notification.readAt;
        dto.createdAt = notification.createdAt;
        return dto;
    }
}
