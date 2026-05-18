import type { RestaurantStaffRole } from '../../../domain/enums/restaurant-staff-role.enum';

export type AddRestaurantStaffCommand = {
    restaurantId: string;
    currentUserId: string;
    targetUserId: string;
    role: RestaurantStaffRole;
};
