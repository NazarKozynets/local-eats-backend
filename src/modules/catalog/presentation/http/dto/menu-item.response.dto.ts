import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';

export class MenuItemResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() restaurantId!: string;
    @ApiPropertyOptional({ nullable: true }) categoryId!: string | null;
    @ApiProperty() name!: string;
    @ApiPropertyOptional({ nullable: true }) description!: string | null;
    @ApiPropertyOptional({ nullable: true }) imageUrl!: string | null;
    @ApiProperty() price!: number;
    @ApiProperty({ enum: MenuItemStatus }) status!: MenuItemStatus;
    @ApiPropertyOptional({ nullable: true }) weightGrams!: number | null;
    @ApiPropertyOptional({ nullable: true }) estimatedCookTime!: number | null;
    @ApiProperty() isPopular!: boolean;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}
