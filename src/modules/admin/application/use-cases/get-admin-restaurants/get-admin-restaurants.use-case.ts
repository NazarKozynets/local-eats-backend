import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_RESTAURANT_READER,
    type AdminRestaurantReadModel,
    type AdminRestaurantReader,
} from '../../ports/admin-restaurant-reader.port';
import type { GetAdminRestaurantsCommand } from './get-admin-restaurants.command';

@Injectable()
export class GetAdminRestaurantsUseCase {
    constructor(
        @Inject(ADMIN_RESTAURANT_READER)
        private readonly restaurantReader: AdminRestaurantReader,
    ) {}

    execute(command: GetAdminRestaurantsCommand): Promise<AdminRestaurantReadModel[]> {
        return this.restaurantReader.findMany(command);
    }
}
