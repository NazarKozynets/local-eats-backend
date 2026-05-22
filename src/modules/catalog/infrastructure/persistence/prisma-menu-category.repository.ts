import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { MenuCategory } from '../../domain/entities/menu-category.entity';
import type { MenuCategoryRepository } from '../../application/ports/menu-category.repository.port';
import { MenuCategoryMapper } from './mappers/menu-category.mapper';

@Injectable()
export class PrismaMenuCategoryRepository implements MenuCategoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<MenuCategory | null> {
        const row = await this.prisma.menuCategory.findUnique({
            where: { id: id.value },
        });

        return row ? MenuCategoryMapper.toDomain(row) : null;
    }

    async findByRestaurantId(restaurantId: UUID): Promise<MenuCategory[]> {
        const rows = await this.prisma.menuCategory.findMany({
            where: { restaurantId: restaurantId.value },
            orderBy: { position: 'asc' },
        });

        return rows.map(MenuCategoryMapper.toDomain);
    }

    async existsByNameInRestaurant(restaurantId: UUID, name: string): Promise<boolean> {
        const row = await this.prisma.menuCategory.findFirst({
            where: { restaurantId: restaurantId.value, name },
            select: { id: true },
        });

        return row !== null;
    }

    async hasItems(categoryId: UUID): Promise<boolean> {
        const count = await this.prisma.menuItem.count({
            where: { categoryId: categoryId.value },
        });

        return count > 0;
    }

    async save(category: MenuCategory): Promise<void> {
        const data = MenuCategoryMapper.toPersistence(category);

        await this.prisma.menuCategory.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                position: data.position,
                isActive: data.isActive,
                updatedAt: data.updatedAt,
            },
        });
    }

    async delete(categoryId: UUID): Promise<void> {
        await this.prisma.menuCategory.delete({
            where: { id: categoryId.value },
        });
    }
}
