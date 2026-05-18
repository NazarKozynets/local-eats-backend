import type { Restaurant } from '../../domain/entities/restaurant.entity';
import type { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const RESTAURANT_REPOSITORY = Symbol('RESTAURANT_REPOSITORY');

export interface RestaurantRepository {
    findById(id: UUID): Promise<Restaurant | null>;
    save(restaurant: Restaurant): Promise<void>;
    createWithOwnerStaff(restaurant: Restaurant, ownerStaff: RestaurantStaff): Promise<void>;
}
