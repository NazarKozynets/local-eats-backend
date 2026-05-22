import { ApiProperty } from '@nestjs/swagger';
import { MenuCategoryResponseDto } from './menu-category.response.dto';
import { MenuItemResponseDto } from './menu-item.response.dto';

export class MenuCategoryWithItemsResponseDto extends MenuCategoryResponseDto {
    @ApiProperty({ type: [MenuItemResponseDto] })
    items!: MenuItemResponseDto[];
}

export class RestaurantCatalogResponseDto {
    @ApiProperty() restaurantId!: string;
    @ApiProperty({ type: [MenuCategoryWithItemsResponseDto] })
    categories!: MenuCategoryWithItemsResponseDto[];
    @ApiProperty({ type: [MenuItemResponseDto] })
    uncategorizedItems!: MenuItemResponseDto[];
}
