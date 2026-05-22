import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';

export class ChangeMenuItemStatusRequestDto {
    @ApiProperty({ enum: MenuItemStatus, example: MenuItemStatus.AVAILABLE })
    @IsEnum(MenuItemStatus)
    status!: MenuItemStatus;
}
