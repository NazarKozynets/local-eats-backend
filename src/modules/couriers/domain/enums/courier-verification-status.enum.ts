export const CourierVerificationStatus = {
    UNVERIFIED: 'UNVERIFIED',
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
} as const;

export type CourierVerificationStatus = (typeof CourierVerificationStatus)[keyof typeof CourierVerificationStatus];
