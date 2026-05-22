export const CourierAvailabilityStatus = {
    OFFLINE: 'OFFLINE',
    ONLINE: 'ONLINE',
    BUSY: 'BUSY',
} as const;

export type CourierAvailabilityStatus = (typeof CourierAvailabilityStatus)[keyof typeof CourierAvailabilityStatus];
