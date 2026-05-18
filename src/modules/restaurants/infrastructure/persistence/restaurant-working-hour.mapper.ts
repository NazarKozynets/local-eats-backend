import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantWorkingHour } from '../../domain/entities/restaurant-working-hour.entity';

export class RestaurantWorkingHourMapper {
    static toDomain(raw: any): RestaurantWorkingHour {
        return RestaurantWorkingHour.restore({
            id: UUID.create(raw.id),
            restaurantId: UUID.create(raw.restaurantId),
            dayOfWeek: raw.dayOfWeek,
            opensAt: raw.opensAt ?? null,
            closesAt: raw.closesAt ?? null,
            isClosed: raw.isClosed,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(hour: RestaurantWorkingHour) {
        return {
            id: hour.id.value,
            restaurantId: hour.restaurantId.value,
            dayOfWeek: hour.dayOfWeek,
            opensAt: hour.opensAt,
            closesAt: hour.closesAt,
            isClosed: hour.isClosed,
            createdAt: hour.createdAt,
            updatedAt: hour.updatedAt,
        };
    }
}
