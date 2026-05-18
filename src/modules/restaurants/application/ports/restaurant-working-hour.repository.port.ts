import type { RestaurantWorkingHour } from '../../domain/entities/restaurant-working-hour.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const RESTAURANT_WORKING_HOUR_REPOSITORY = Symbol('RESTAURANT_WORKING_HOUR_REPOSITORY');

export interface RestaurantWorkingHourRepository {
    findManyByRestaurantId(restaurantId: UUID): Promise<RestaurantWorkingHour[]>;
    replaceForRestaurant(restaurantId: UUID, hours: RestaurantWorkingHour[]): Promise<void>;
}
