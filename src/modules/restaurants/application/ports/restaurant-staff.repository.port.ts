import type { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const RESTAURANT_STAFF_REPOSITORY = Symbol('RESTAURANT_STAFF_REPOSITORY');

export interface RestaurantStaffRepository {
    findByRestaurantAndUser(restaurantId: UUID, userId: UUID): Promise<RestaurantStaff | null>;
    findManyByUserId(userId: UUID): Promise<RestaurantStaff[]>;
    findManyByRestaurantId(restaurantId: UUID): Promise<RestaurantStaff[]>;
    exists(restaurantId: UUID, userId: UUID): Promise<boolean>;
    countOwners(restaurantId: UUID): Promise<number>;
    save(staff: RestaurantStaff): Promise<void>;
    delete(staffId: UUID): Promise<void>;
}
