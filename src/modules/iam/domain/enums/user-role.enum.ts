export const UserRole = {
    CUSTOMER: 'CUSTOMER',
    PROVIDER: 'PROVIDER',
    ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];