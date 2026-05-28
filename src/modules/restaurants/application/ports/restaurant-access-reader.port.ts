import type { RestaurantStaffRole } from '../../domain/enums/restaurant-staff-role.enum';

export const RESTAURANT_ACCESS_READER = Symbol('RESTAURANT_ACCESS_READER');

export interface RestaurantAccessReader {
    canManageRestaurant(userId: string, restaurantId: string): Promise<boolean>;
    getStaffRole(userId: string, restaurantId: string): Promise<RestaurantStaffRole | null>;
    isRestaurantActive(restaurantId: string): Promise<boolean>;
    existsActiveRestaurant(restaurantId: string): Promise<boolean>;
    findOwnerUserIds(restaurantId: string): Promise<string[]>;
}
