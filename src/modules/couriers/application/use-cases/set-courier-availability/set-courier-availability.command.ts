import type { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';

export type SetCourierAvailabilityCommand = {
    currentUserId: string;
    availabilityStatus: CourierAvailabilityStatus;
};
