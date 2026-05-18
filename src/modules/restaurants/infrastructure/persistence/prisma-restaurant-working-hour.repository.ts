import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { RestaurantWorkingHour } from '../../domain/entities/restaurant-working-hour.entity';
import type { RestaurantWorkingHourRepository } from '../../application/ports/restaurant-working-hour.repository.port';
import { RestaurantWorkingHourMapper } from './restaurant-working-hour.mapper';

@Injectable()
export class PrismaRestaurantWorkingHourRepository implements RestaurantWorkingHourRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findManyByRestaurantId(restaurantId: UUID): Promise<RestaurantWorkingHour[]> {
        const rows = await this.prisma.restaurantWorkingHour.findMany({
            where: { restaurantId: restaurantId.value },
            orderBy: { dayOfWeek: 'asc' },
        });

        return rows.map(RestaurantWorkingHourMapper.toDomain);
    }

    async replaceForRestaurant(restaurantId: UUID, hours: RestaurantWorkingHour[]): Promise<void> {
        const data = hours.map(RestaurantWorkingHourMapper.toPersistence);

        await this.prisma.$transaction([
            this.prisma.restaurantWorkingHour.deleteMany({
                where: { restaurantId: restaurantId.value },
            }),
            this.prisma.restaurantWorkingHour.createMany({ data }),
        ]);
    }
}
