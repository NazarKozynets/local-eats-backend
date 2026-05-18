export type WorkingHourEntry = {
    dayOfWeek: number;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
};

export type UpdateRestaurantWorkingHoursCommand = {
    restaurantId: string;
    currentUserId: string;
    hours: WorkingHourEntry[];
};
