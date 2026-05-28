export const DeliveryProblemType = {
    RESTAURANT_DELAY: 'RESTAURANT_DELAY',
    COURIER_DELAY: 'COURIER_DELAY',
    CUSTOMER_UNAVAILABLE: 'CUSTOMER_UNAVAILABLE',
    WRONG_ADDRESS: 'WRONG_ADDRESS',
    DAMAGED_ORDER: 'DAMAGED_ORDER',
    MISSING_ITEMS: 'MISSING_ITEMS',
    OTHER: 'OTHER',
} as const;

export type DeliveryProblemType = (typeof DeliveryProblemType)[keyof typeof DeliveryProblemType];
