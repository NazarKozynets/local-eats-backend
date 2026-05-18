export const RestaurantVerificationStatus = {
    UNVERIFIED: 'UNVERIFIED',
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
} as const;

export type RestaurantVerificationStatus =
    (typeof RestaurantVerificationStatus)[keyof typeof RestaurantVerificationStatus];
