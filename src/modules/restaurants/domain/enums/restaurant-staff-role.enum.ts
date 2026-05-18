export const RestaurantStaffRole = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
} as const;

export type RestaurantStaffRole = (typeof RestaurantStaffRole)[keyof typeof RestaurantStaffRole];
