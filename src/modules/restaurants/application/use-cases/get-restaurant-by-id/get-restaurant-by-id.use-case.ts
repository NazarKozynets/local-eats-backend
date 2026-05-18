import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantNotFoundError } from '../../../domain/errors/restaurant-not-found.error';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import type { GetRestaurantByIdCommand } from './get-restaurant-by-id.command';
import type { GetRestaurantByIdResult } from './get-restaurant-by-id.result';

@Injectable()
export class GetRestaurantByIdUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
    ) {}

    async execute(command: GetRestaurantByIdCommand): Promise<GetRestaurantByIdResult> {
        const restaurantId = UUID.create(command.restaurantId);
        const restaurant = await this.restaurantRepository.findById(restaurantId);

        if (!restaurant) {
            throw new RestaurantNotFoundError();
        }

        return {
            id: restaurant.id.value,
            name: restaurant.name.value,
            description: restaurant.description,
            logoUrl: restaurant.logoUrl,
            coverUrl: restaurant.coverUrl,
            status: restaurant.status,
            verificationStatus: restaurant.verificationStatus,
            verificationRejectedReason: restaurant.verificationRejectedReason,
            verifiedAt: restaurant.verifiedAt,
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
