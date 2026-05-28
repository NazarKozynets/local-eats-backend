import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { RESTAURANT_REPOSITORY } from './application/ports/restaurant.repository.port';
import { RESTAURANT_STAFF_REPOSITORY } from './application/ports/restaurant-staff.repository.port';
import { RESTAURANT_WORKING_HOUR_REPOSITORY } from './application/ports/restaurant-working-hour.repository.port';
import { RESTAURANT_ACCESS_READER } from './application/ports/restaurant-access-reader.port';
import { PrismaRestaurantRepository } from './infrastructure/persistence/prisma-restaurant.repository';
import { PrismaRestaurantStaffRepository } from './infrastructure/persistence/prisma-restaurant-staff.repository';
import { PrismaRestaurantWorkingHourRepository } from './infrastructure/persistence/prisma-restaurant-working-hour.repository';
import { PrismaRestaurantAccessReader } from './infrastructure/persistence/prisma-restaurant-access-reader';
import { CreateRestaurantUseCase } from './application/use-cases/create-restaurant/create-restaurant.use-case';
import { GetMyRestaurantsUseCase } from './application/use-cases/get-my-restaurants/get-my-restaurants.use-case';
import { GetRestaurantByIdUseCase } from './application/use-cases/get-restaurant-by-id/get-restaurant-by-id.use-case';
import { UpdateRestaurantUseCase } from './application/use-cases/update-restaurant/update-restaurant.use-case';
import { SubmitRestaurantForVerificationUseCase } from './application/use-cases/submit-restaurant-for-verification/submit-restaurant-for-verification.use-case';
import { ApproveRestaurantUseCase } from './application/use-cases/approve-restaurant/approve-restaurant.use-case';
import { RejectRestaurantUseCase } from './application/use-cases/reject-restaurant/reject-restaurant.use-case';
import { PauseRestaurantUseCase } from './application/use-cases/pause-restaurant/pause-restaurant.use-case';
import { ActivateRestaurantUseCase } from './application/use-cases/activate-restaurant/activate-restaurant.use-case';
import { BlockRestaurantUseCase } from './application/use-cases/block-restaurant/block-restaurant.use-case';
import { AddRestaurantStaffUseCase } from './application/use-cases/add-restaurant-staff/add-restaurant-staff.use-case';
import { RemoveRestaurantStaffUseCase } from './application/use-cases/remove-restaurant-staff/remove-restaurant-staff.use-case';
import { UpdateRestaurantWorkingHoursUseCase } from './application/use-cases/update-restaurant-working-hours/update-restaurant-working-hours.use-case';
import { RestaurantsController } from './presentation/controllers/restaurants.controller';
import { AdminRestaurantsController } from './presentation/controllers/admin-restaurants.controller';

@Module({
    imports: [IamModule],
    controllers: [RestaurantsController, AdminRestaurantsController],
    providers: [
        {
            provide: RESTAURANT_REPOSITORY,
            useClass: PrismaRestaurantRepository,
        },
        {
            provide: RESTAURANT_STAFF_REPOSITORY,
            useClass: PrismaRestaurantStaffRepository,
        },
        {
            provide: RESTAURANT_WORKING_HOUR_REPOSITORY,
            useClass: PrismaRestaurantWorkingHourRepository,
        },
        {
            provide: RESTAURANT_ACCESS_READER,
            useClass: PrismaRestaurantAccessReader,
        },
        CreateRestaurantUseCase,
        GetMyRestaurantsUseCase,
        GetRestaurantByIdUseCase,
        UpdateRestaurantUseCase,
        SubmitRestaurantForVerificationUseCase,
        ApproveRestaurantUseCase,
        RejectRestaurantUseCase,
        PauseRestaurantUseCase,
        ActivateRestaurantUseCase,
        BlockRestaurantUseCase,
        AddRestaurantStaffUseCase,
        RemoveRestaurantStaffUseCase,
        UpdateRestaurantWorkingHoursUseCase,
    ],
    exports: [RESTAURANT_ACCESS_READER],
})
export class RestaurantsModule {}
