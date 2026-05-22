import type { MenuItemStatus } from '../../domain/enums/menu-item-status.enum';

export type MenuItemReadModel = {
    id: string;
    restaurantId: string;
    categoryId: string | null;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    status: MenuItemStatus;
    weightGrams: number | null;
    estimatedCookTime: number | null;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type MenuCategoryWithItemsReadModel = {
    id: string;
    restaurantId: string;
    name: string;
    position: number;
    isActive: boolean;
    items: MenuItemReadModel[];
    createdAt: Date;
    updatedAt: Date;
};

export type CatalogReadModel = {
    restaurantId: string;
    categories: MenuCategoryWithItemsReadModel[];
    uncategorizedItems: MenuItemReadModel[];
};

export const CATALOG_READER = Symbol('CATALOG_READER');

export interface CatalogReader {
    getManagerCatalog(restaurantId: string): Promise<CatalogReadModel>;
    getPublicCatalog(restaurantId: string): Promise<CatalogReadModel>;
}
