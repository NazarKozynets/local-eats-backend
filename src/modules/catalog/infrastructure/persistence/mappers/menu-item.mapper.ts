import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuItemName } from '../../../domain/value-objects/menu-item-name.vo';
import { MenuItemPrice } from '../../../domain/value-objects/menu-item-price.vo';
import { MenuItem } from '../../../domain/entities/menu-item.entity';
import type { MenuItemStatus } from '../../../domain/enums/menu-item-status.enum';

export class MenuItemMapper {
    static toDomain(raw: any): MenuItem {
        return MenuItem.restore({
            id: UUID.create(raw.id),
            restaurantId: UUID.create(raw.restaurantId),
            categoryId: raw.categoryId ? UUID.create(raw.categoryId) : null,
            name: MenuItemName.create(raw.name),
            description: raw.description ?? null,
            imageUrl: raw.imageUrl ?? null,
            price: MenuItemPrice.create(Number(raw.price)),
            status: raw.status as MenuItemStatus,
            weightGrams: raw.weightGrams ?? null,
            estimatedCookTime: raw.estimatedCookTime ?? null,
            isPopular: raw.isPopular,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(item: MenuItem) {
        return {
            id: item.id.value,
            restaurantId: item.restaurantId.value,
            categoryId: item.categoryId?.value ?? null,
            name: item.name.value,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price.value,
            status: item.status,
            weightGrams: item.weightGrams,
            estimatedCookTime: item.estimatedCookTime,
            isPopular: item.isPopular,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
