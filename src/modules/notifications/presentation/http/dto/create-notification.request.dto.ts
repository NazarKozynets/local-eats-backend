import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../../../domain/enums/notification-type.enum';

export class CreateNotificationRequestDto {
    @ApiProperty({ description: 'Target user ID' })
    @IsUUID()
    @IsNotEmpty()
    userId!: string;

    @ApiProperty({ enum: NotificationType, description: 'Notification type' })
    @IsEnum(NotificationType)
    type!: NotificationType;

    @ApiProperty({ description: 'Notification title' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({ description: 'Notification body' })
    @IsString()
    @IsNotEmpty()
    body!: string;

    @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Optional payload data' })
    @IsOptional()
    @IsObject()
    data?: Record<string, unknown>;
}
