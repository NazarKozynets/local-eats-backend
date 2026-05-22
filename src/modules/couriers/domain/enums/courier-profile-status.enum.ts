export const CourierProfileStatus = {
    INCOMPLETE: 'INCOMPLETE',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    BLOCKED: 'BLOCKED',
    REJECTED: 'REJECTED',
} as const;

export type CourierProfileStatus = (typeof CourierProfileStatus)[keyof typeof CourierProfileStatus];
