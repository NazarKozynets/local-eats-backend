import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    CatalogReader,
    CatalogReadModel,
    MenuItemReadModel,
} from '../../application/ports/catalog-reader.port';
import type { MenuItemStatus } from '../../domain/enums/menu-item-status.enum';

@Injectable()
export class PrismaCatalogReader implements CatalogReader {
    constructor(private readonly prisma: PrismaService) {}

    async getManagerCatalog(restaurantId: string): Promise<CatalogReadModel> {
        const [categories, uncategorizedItems] = await Promise.all([
            this.prisma.menuCategory.findMany({
                where: { restaurantId },
                orderBy: { position: 'asc' },
                include: {
                    items: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            }),
            this.prisma.menuItem.findMany({
                where: { restaurantId, categoryId: null },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        return {
            restaurantId,
            categories: categories.map((cat) => ({
                id: cat.id,
                restaurantId: cat.restaurantId,
                name: cat.name,
                position: cat.position,
                isActive: cat.isActive,
                items: cat.items.map(this.toItemReadModel),
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt,
            })),
            uncategorizedItems: uncategorizedItems.map(this.toItemReadModel),
        };
    }

    async getPublicCatalog(restaurantId: string): Promise<CatalogReadModel> {
        const [categories, uncategorizedItems] = await Promise.all([
            this.prisma.menuCategory.findMany({
                where: { restaurantId, isActive: true },
                orderBy: { position: 'asc' },
                include: {
                    items: {
                        where: { status: { not: 'HIDDEN' } },
                        orderBy: { createdAt: 'asc' },
                    },
                },
            }),
            this.prisma.menuItem.findMany({
                where: {
                    restaurantId,
                    categoryId: null,
                    status: { not: 'HIDDEN' },
                },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        return {
            restaurantId,
            categories: categories.map((cat) => ({
                id: cat.id,
                restaurantId: cat.restaurantId,
                name: cat.name,
                position: cat.position,
                isActive: cat.isActive,
                items: cat.items.map(this.toItemReadModel),
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt,
            })),
            uncategorizedItems: uncategorizedItems.map(this.toItemReadModel),
        };
    }

    private toItemReadModel(item: any): MenuItemReadModel {
        return {
            id: item.id,
            restaurantId: item.restaurantId,
            categoryId: item.categoryId ?? null,
            name: item.name,
            description: item.description ?? null,
            imageUrl: item.imageUrl ?? null,
            price: Number(item.price),
            status: item.status as MenuItemStatus,
            weightGrams: item.weightGrams ?? null,
            estimatedCookTime: item.estimatedCookTime ?? null,
            isPopular: item.isPopular,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
