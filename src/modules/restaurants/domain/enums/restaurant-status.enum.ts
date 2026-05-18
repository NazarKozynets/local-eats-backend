export const RestaurantStatus = {
    DRAFT: 'DRAFT',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    BLOCKED: 'BLOCKED',
    REJECTED: 'REJECTED',
} as const;

export type RestaurantStatus = (typeof RestaurantStatus)[keyof typeof RestaurantStatus];
