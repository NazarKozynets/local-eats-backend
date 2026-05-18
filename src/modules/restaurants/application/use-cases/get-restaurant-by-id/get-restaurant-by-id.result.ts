import type { RestaurantStatus } from '../../../domain/enums/restaurant-status.enum';
import type { RestaurantVerificationStatus } from '../../../domain/enums/restaurant-verification-status.enum';

export type GetRestaurantByIdResult = {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    status: RestaurantStatus;
    verificationStatus: RestaurantVerificationStatus;
    verificationRejectedReason: string | null;
    verifiedAt: Date | null;
    city: string;
    addressText: string;
    phone: string | null;
    email: string | null;
    minOrderAmount: number;
    deliveryFee: number;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
};
