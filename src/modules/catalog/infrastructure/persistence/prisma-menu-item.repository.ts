import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { MenuItem } from '../../domain/entities/menu-item.entity';
import type { MenuItemRepository } from '../../application/ports/menu-item.repository.port';
import { MenuItemMapper } from './mappers/menu-item.mapper';

@Injectable()
export class PrismaMenuItemRepository implements MenuItemRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<MenuItem | null> {
        const row = await this.prisma.menuItem.findUnique({
            where: { id: id.value },
        });

        return row ? MenuItemMapper.toDomain(row) : null;
    }

    async findByRestaurantId(restaurantId: UUID): Promise<MenuItem[]> {
        const rows = await this.prisma.menuItem.findMany({
            where: { restaurantId: restaurantId.value },
            orderBy: { createdAt: 'asc' },
        });

        return rows.map(MenuItemMapper.toDomain);
    }

    async findByCategoryId(categoryId: UUID): Promise<MenuItem[]> {
        const rows = await this.prisma.menuItem.findMany({
            where: { categoryId: categoryId.value },
            orderBy: { createdAt: 'asc' },
        });

        return rows.map(MenuItemMapper.toDomain);
    }

    async save(item: MenuItem): Promise<void> {
        const data = MenuItemMapper.toPersistence(item);

        await this.prisma.menuItem.upsert({
            where: { id: data.id },
            create: data,
            update: {
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                price: data.price,
                status: data.status,
                weightGrams: data.weightGrams,
                estimatedCookTime: data.estimatedCookTime,
                isPopular: data.isPopular,
                updatedAt: data.updatedAt,
            },
        });
    }
}
