export const UserRole = {
    CUSTOMER: 'CUSTOMER',
    RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
    COURIER: 'COURIER',
    ADMIN: 'ADMIN',
    /** @deprecated use RESTAURANT_MANAGER */
    PROVIDER: 'PROVIDER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];