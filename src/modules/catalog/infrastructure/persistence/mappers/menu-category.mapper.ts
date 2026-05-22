import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategoryName } from '../../../domain/value-objects/menu-category-name.vo';
import { MenuCategory } from '../../../domain/entities/menu-category.entity';

export class MenuCategoryMapper {
    static toDomain(raw: any): MenuCategory {
        return MenuCategory.restore({
            id: UUID.create(raw.id),
            restaurantId: UUID.create(raw.restaurantId),
            name: MenuCategoryName.create(raw.name),
            position: raw.position,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(category: MenuCategory) {
        return {
            id: category.id.value,
            restaurantId: category.restaurantId.value,
            name: category.name.value,
            position: category.position,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}
