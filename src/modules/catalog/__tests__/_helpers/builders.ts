import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategoryName } from '../../domain/value-objects/menu-category-name.vo';
import { MenuItemName } from '../../domain/value-objects/menu-item-name.vo';
import { MenuItemPrice } from '../../domain/value-objects/menu-item-price.vo';
import { MenuCategory } from '../../domain/entities/menu-category.entity';
import { MenuItem } from '../../domain/entities/menu-item.entity';
import { MenuItemStatus } from '../../domain/enums/menu-item-status.enum';

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001';
export const TEST_CATEGORY_ID = '770e8400-e29b-41d4-a716-446655440002';
export const TEST_ITEM_ID = '880e8400-e29b-41d4-a716-446655440003';
export const TEST_OTHER_RESTAURANT_ID = '990e8400-e29b-41d4-a716-446655440004';
export const TEST_OTHER_CATEGORY_ID = 'aa0e8400-e29b-41d4-a716-446655440005';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

type BuildMenuCategoryOverrides = Partial<{
    id: UUID;
    restaurantId: UUID;
    name: MenuCategoryName;
    position: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildMenuCategory(overrides: BuildMenuCategoryOverrides = {}): MenuCategory {
    return MenuCategory.restore({
        id: overrides.id ?? UUID.create(TEST_CATEGORY_ID),
        restaurantId: overrides.restaurantId ?? UUID.create(TEST_RESTAURANT_ID),
        name: overrides.name ?? MenuCategoryName.create('Test Category'),
        position: overrides.position ?? 0,
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}

type BuildMenuItemOverrides = Partial<{
    id: UUID;
    restaurantId: UUID;
    categoryId: UUID | null;
    name: MenuItemName;
    description: string | null;
    imageUrl: string | null;
    price: MenuItemPrice;
    status: MenuItemStatus;
    weightGrams: number | null;
    estimatedCookTime: number | null;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;

export function buildMenuItem(overrides: BuildMenuItemOverrides = {}): MenuItem {
    return MenuItem.restore({
        id: overrides.id ?? UUID.create(TEST_ITEM_ID),
        restaurantId: overrides.restaurantId ?? UUID.create(TEST_RESTAURANT_ID),
        categoryId: overrides.categoryId !== undefined ? overrides.categoryId : UUID.create(TEST_CATEGORY_ID),
        name: overrides.name ?? MenuItemName.create('Test Item'),
        description: overrides.description !== undefined ? overrides.description : null,
        imageUrl: overrides.imageUrl !== undefined ? overrides.imageUrl : null,
        price: overrides.price ?? MenuItemPrice.create(9.99),
        status: overrides.status ?? MenuItemStatus.AVAILABLE,
        weightGrams: overrides.weightGrams !== undefined ? overrides.weightGrams : null,
        estimatedCookTime: overrides.estimatedCookTime !== undefined ? overrides.estimatedCookTime : null,
        isPopular: overrides.isPopular ?? false,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}
