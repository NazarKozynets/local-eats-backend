import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { ADMIN_DASHBOARD_READER } from './application/ports/admin-dashboard-reader.port';
import { ADMIN_USER_READER } from './application/ports/admin-user-reader.port';
import { ADMIN_RESTAURANT_READER } from './application/ports/admin-restaurant-reader.port';
import { ADMIN_COURIER_READER } from './application/ports/admin-courier-reader.port';
import { ADMIN_ORDER_READER } from './application/ports/admin-order-reader.port';
import { ADMIN_PAYMENT_READER } from './application/ports/admin-payment-reader.port';
import { ADMIN_DELIVERY_PROBLEM_READER } from './application/ports/admin-delivery-problem-reader.port';
import { ADMIN_DELIVERY_PROBLEM_ACTIONS } from './application/ports/admin-delivery-problem-actions.port';
import { ADMIN_REVIEW_READER } from './application/ports/admin-review-reader.port';
import { PrismaAdminDashboardReader } from './infrastructure/readers/prisma-admin-dashboard-reader';
import { PrismaAdminUserReader } from './infrastructure/readers/prisma-admin-user-reader';
import { PrismaAdminRestaurantReader } from './infrastructure/readers/prisma-admin-restaurant-reader';
import { PrismaAdminCourierReader } from './infrastructure/readers/prisma-admin-courier-reader';
import { PrismaAdminOrderReader } from './infrastructure/readers/prisma-admin-order-reader';
import { PrismaAdminPaymentReader } from './infrastructure/readers/prisma-admin-payment-reader';
import { PrismaAdminDeliveryProblemReader } from './infrastructure/readers/prisma-admin-delivery-problem-reader';
import { PrismaAdminDeliveryProblemActions } from './infrastructure/actions/prisma-admin-delivery-problem-actions';
import { PrismaAdminReviewReader } from './infrastructure/readers/prisma-admin-review-reader';
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard/get-admin-dashboard.use-case';
import { GetAdminUsersUseCase } from './application/use-cases/get-admin-users/get-admin-users.use-case';
import { GetAdminRestaurantsUseCase } from './application/use-cases/get-admin-restaurants/get-admin-restaurants.use-case';
import { GetAdminCouriersUseCase } from './application/use-cases/get-admin-couriers/get-admin-couriers.use-case';
import { GetAdminOrdersUseCase } from './application/use-cases/get-admin-orders/get-admin-orders.use-case';
import { GetAdminPaymentsUseCase } from './application/use-cases/get-admin-payments/get-admin-payments.use-case';
import { GetAdminDeliveryProblemsUseCase } from './application/use-cases/get-admin-delivery-problems/get-admin-delivery-problems.use-case';
import { ResolveDeliveryProblemUseCase } from './application/use-cases/resolve-delivery-problem/resolve-delivery-problem.use-case';
import { GetAdminReviewsUseCase } from './application/use-cases/get-admin-reviews/get-admin-reviews.use-case';
import { AdminDashboardController } from './presentation/http/admin-dashboard.controller';
import { AdminUsersController } from './presentation/http/admin-users.controller';
import { AdminRestaurantsListController } from './presentation/http/admin-restaurants.controller';
import { AdminCouriersListController } from './presentation/http/admin-couriers.controller';
import { AdminOrdersController } from './presentation/http/admin-orders.controller';
import { AdminPaymentsListController } from './presentation/http/admin-payments.controller';
import { AdminDeliveryProblemsController } from './presentation/http/admin-delivery-problems.controller';
import { AdminReviewsListController } from './presentation/http/admin-reviews.controller';

@Module({
    imports: [IamModule],
    controllers: [
        AdminDashboardController,
        AdminUsersController,
        AdminRestaurantsListController,
        AdminCouriersListController,
        AdminOrdersController,
        AdminPaymentsListController,
        AdminDeliveryProblemsController,
        AdminReviewsListController,
    ],
    providers: [
        { provide: ADMIN_DASHBOARD_READER, useClass: PrismaAdminDashboardReader },
        { provide: ADMIN_USER_READER, useClass: PrismaAdminUserReader },
        { provide: ADMIN_RESTAURANT_READER, useClass: PrismaAdminRestaurantReader },
        { provide: ADMIN_COURIER_READER, useClass: PrismaAdminCourierReader },
        { provide: ADMIN_ORDER_READER, useClass: PrismaAdminOrderReader },
        { provide: ADMIN_PAYMENT_READER, useClass: PrismaAdminPaymentReader },
        { provide: ADMIN_DELIVERY_PROBLEM_READER, useClass: PrismaAdminDeliveryProblemReader },
        { provide: ADMIN_DELIVERY_PROBLEM_ACTIONS, useClass: PrismaAdminDeliveryProblemActions },
        { provide: ADMIN_REVIEW_READER, useClass: PrismaAdminReviewReader },
        GetAdminDashboardUseCase,
        GetAdminUsersUseCase,
        GetAdminRestaurantsUseCase,
        GetAdminCouriersUseCase,
        GetAdminOrdersUseCase,
        GetAdminPaymentsUseCase,
        GetAdminDeliveryProblemsUseCase,
        ResolveDeliveryProblemUseCase,
        GetAdminReviewsUseCase,
    ],
})
export class AdminModule {}
