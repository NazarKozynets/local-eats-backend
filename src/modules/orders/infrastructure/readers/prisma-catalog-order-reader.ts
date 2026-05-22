import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    CatalogOrderReader,
    OrderableItemReadModel,
} from '../../application/ports/catalog-order-reader.port';

@Injectable()
export class PrismaCatalogOrderReader implements CatalogOrderReader {
    constructor(private readonly prisma: PrismaService) {}

    async getItemsByIds(ids: string[]): Promise<OrderableItemReadModel[]> {
        if (ids.length === 0) {
            return [];
        }

        const rows = await this.prisma.menuItem.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                restaurantId: true,
                name: true,
                price: true,
                status: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            restaurantId: row.restaurantId,
            name: row.name,
            price: Number(row.price),
            status: row.status,
        }));
    }
}
