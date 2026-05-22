import type { MenuCategory } from '../../domain/entities/menu-category.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const MENU_CATEGORY_REPOSITORY = Symbol('MENU_CATEGORY_REPOSITORY');

export interface MenuCategoryRepository {
    findById(id: UUID): Promise<MenuCategory | null>;
    findByRestaurantId(restaurantId: UUID): Promise<MenuCategory[]>;
    existsByNameInRestaurant(restaurantId: UUID, name: string): Promise<boolean>;
    hasItems(categoryId: UUID): Promise<boolean>;
    save(category: MenuCategory): Promise<void>;
    delete(categoryId: UUID): Promise<void>;
}
