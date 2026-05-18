import { Inject, Injectable } from '@nestjs/common';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import {
    RESTAURANT_REPOSITORY,
    type RestaurantRepository,
} from '../../ports/restaurant.repository.port';
import {
    RESTAURANT_STAFF_REPOSITORY,
    type RestaurantStaffRepository,
} from '../../ports/restaurant-staff.repository.port';
import type { GetMyRestaurantsCommand } from './get-my-restaurants.command';
import type { GetMyRestaurantsResult } from './get-my-restaurants.result';

@Injectable()
export class GetMyRestaurantsUseCase {
    constructor(
        @Inject(RESTAURANT_REPOSITORY)
        private readonly restaurantRepository: RestaurantRepository,
        @Inject(RESTAURANT_STAFF_REPOSITORY)
        private readonly staffRepository: RestaurantStaffRepository,
    ) {}

    async execute(command: GetMyRestaurantsCommand): Promise<GetMyRestaurantsResult> {
        const userId = UUID.create(command.currentUserId);
        const staffEntries = await this.staffRepository.findManyByUserId(userId);

        const results = await Promise.all(
            staffEntries.map(async (staff) => {
                const restaurant = await this.restaurantRepository.findById(staff.restaurantId);
                if (!restaurant) return null;

                return {
                    id: restaurant.id.value,
                    name: restaurant.name.value,
                    status: restaurant.status,
                    verificationStatus: restaurant.verificationStatus,
                    city: restaurant.city,
                    staffRole: staff.role,
                    createdAt: restaurant.createdAt,
                };
            }),
        );

        return results.filter((r): r is NonNullable<typeof r> => r !== null);
    }
}
