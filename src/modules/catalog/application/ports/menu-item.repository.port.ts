import type { MenuItem } from '../../domain/entities/menu-item.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const MENU_ITEM_REPOSITORY = Symbol('MENU_ITEM_REPOSITORY');

export interface MenuItemRepository {
    findById(id: UUID): Promise<MenuItem | null>;
    findByRestaurantId(restaurantId: UUID): Promise<MenuItem[]>;
    findByCategoryId(categoryId: UUID): Promise<MenuItem[]>;
    save(item: MenuItem): Promise<void>;
}
