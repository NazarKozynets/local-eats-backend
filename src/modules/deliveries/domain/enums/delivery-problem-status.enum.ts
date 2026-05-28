export const DeliveryProblemStatus = {
    OPEN: 'OPEN',
    RESOLVED: 'RESOLVED',
    CANCELLED: 'CANCELLED',
} as const;

export type DeliveryProblemStatus = (typeof DeliveryProblemStatus)[keyof typeof DeliveryProblemStatus];
