export type UpdateRestaurantCommand = {
    restaurantId: string;
    currentUserId: string;
    name?: string;
    description?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    city?: string;
    addressText?: string;
    phone?: string | null;
    email?: string | null;
    minOrderAmount?: number;
    deliveryFee?: number;
};
