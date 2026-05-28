import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { OrdersModule } from '../orders/orders.module';
import { CouriersModule } from '../couriers/couriers.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { DELIVERY_PROBLEM_REPORT_REPOSITORY } from './application/ports/delivery-problem-report.repository.port';
import { PrismaDeliveryProblemReportRepository } from './infrastructure/persistence/prisma-delivery-problem-report.repository';
import { AssignCourierToOrderUseCase } from './application/use-cases/assign-courier-to-order/assign-courier-to-order.use-case';
import { AcceptDeliveryUseCase } from './application/use-cases/accept-delivery/accept-delivery.use-case';
import { RejectDeliveryUseCase } from './application/use-cases/reject-delivery/reject-delivery.use-case';
import { MarkOrderPickedUpUseCase } from './application/use-cases/mark-order-picked-up/mark-order-picked-up.use-case';
import { StartDeliveryUseCase } from './application/use-cases/start-delivery/start-delivery.use-case';
import { MarkOrderDeliveredUseCase } from './application/use-cases/mark-order-delivered/mark-order-delivered.use-case';
import { ReportDeliveryProblemUseCase } from './application/use-cases/report-delivery-problem/report-delivery-problem.use-case';
import { ResolveDeliveryProblemUseCase } from './application/use-cases/resolve-delivery-problem/resolve-delivery-problem.use-case';
import { UpdateDeliveryLocationUseCase } from './application/use-cases/update-delivery-location/update-delivery-location.use-case';
import { GetMyActiveDeliveryUseCase } from './application/use-cases/get-my-active-delivery/get-my-active-delivery.use-case';
import { GetDeliveryDetailsUseCase } from './application/use-cases/get-delivery-details/get-delivery-details.use-case';
import { DeliveriesController } from './presentation/http/deliveries.controller';
import { CourierDeliveriesController } from './presentation/http/courier-deliveries.controller';
import { AdminDeliveriesController } from './presentation/http/admin-deliveries.controller';

@Module({
    imports: [IamModule, OrdersModule, CouriersModule, RestaurantsModule],
    controllers: [DeliveriesController, CourierDeliveriesController, AdminDeliveriesController],
    providers: [
        {
            provide: DELIVERY_PROBLEM_REPORT_REPOSITORY,
            useClass: PrismaDeliveryProblemReportRepository,
        },
        AssignCourierToOrderUseCase,
        AcceptDeliveryUseCase,
        RejectDeliveryUseCase,
        MarkOrderPickedUpUseCase,
        StartDeliveryUseCase,
        MarkOrderDeliveredUseCase,
        ReportDeliveryProblemUseCase,
        ResolveDeliveryProblemUseCase,
        UpdateDeliveryLocationUseCase,
        GetMyActiveDeliveryUseCase,
        GetDeliveryDetailsUseCase,
    ],
})
export class DeliveriesModule {}
