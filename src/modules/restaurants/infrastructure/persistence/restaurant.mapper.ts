import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantName } from '../../domain/value-objects/restaurant-name.vo';
import { Restaurant } from '../../domain/entities/restaurant.entity';
import type { RestaurantStatus } from '../../domain/enums/restaurant-status.enum';
import type { RestaurantVerificationStatus } from '../../domain/enums/restaurant-verification-status.enum';

export class RestaurantMapper {
    static toDomain(raw: any): Restaurant {
        return Restaurant.restore({
            id: UUID.create(raw.id),
            name: RestaurantName.create(raw.name),
            description: raw.description ?? null,
            logoUrl: raw.logoUrl ?? null,
            coverUrl: raw.coverUrl ?? null,
            verificationStatus: raw.verificationStatus as RestaurantVerificationStatus,
            verificationRejectedReason: raw.verificationRejectedReason ?? null,
            verifiedAt: raw.verifiedAt ?? null,
            status: raw.status as RestaurantStatus,
            city: raw.city,
            addressText: raw.addressText,
            phone: raw.phone ?? null,
            email: raw.email ?? null,
            minOrderAmount: Number(raw.minOrderAmount),
            deliveryFee: Number(raw.deliveryFee),
            ratingAvg: raw.ratingAvg,
            ratingCount: raw.ratingCount,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(restaurant: Restaurant) {
        return {
            id: restaurant.id.value,
            name: restaurant.name.value,
            description: restaurant.description,
            logoUrl: restaurant.logoUrl,
            coverUrl: restaurant.coverUrl,
            verificationStatus: restaurant.verificationStatus,
            verificationRejectedReason: restaurant.verificationRejectedReason,
            verifiedAt: restaurant.verifiedAt,
            status: restaurant.status,
            city: restaurant.city,
            addressText: restaurant.addressText,
            phone: restaurant.phone,
            email: restaurant.email,
            minOrderAmount: restaurant.minOrderAmount,
            deliveryFee: restaurant.deliveryFee,
            ratingAvg: restaurant.ratingAvg,
            ratingCount: restaurant.ratingCount,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt,
        };
    }
}
