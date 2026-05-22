export type OrderableItemReadModel = {
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    status: string;
};

export const CATALOG_ORDER_READER = Symbol('CATALOG_ORDER_READER');

export interface CatalogOrderReader {
    getItemsByIds(ids: string[]): Promise<OrderableItemReadModel[]>;
}
