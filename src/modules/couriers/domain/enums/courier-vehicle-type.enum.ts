export const CourierVehicleType = {
    WALK: 'WALK',
    BICYCLE: 'BICYCLE',
    SCOOTER: 'SCOOTER',
    MOTORBIKE: 'MOTORBIKE',
    CAR: 'CAR',
} as const;

export type CourierVehicleType = (typeof CourierVehicleType)[keyof typeof CourierVehicleType];
