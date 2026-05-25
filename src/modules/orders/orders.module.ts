import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { ORDER_REPOSITORY } from './application/ports/order.repository.port';
import { ORDER_STATUS_HISTORY_REPOSITORY } from './application/ports/order-status-history.repository.port';
import { ORDER_PUBLIC_CODE_GENERATOR } from './application/ports/order-public-code-generator.port';
import { CUSTOMER_ORDER_READER } from './application/ports/customer-order-reader.port';
import { CATALOG_ORDER_READER } from './application/ports/catalog-order-reader.port';
import { RESTAURANT_ORDER_READER } from './application/ports/restaurant-order-reader.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaOrderRepository } from './infrastructure/persistence/prisma-order.repository';
import { PrismaOrderStatusHistoryRepository } from './infrastructure/persistence/prisma-order-status-history.repository';
import { PrismaCustomerOrderReader } from './infrastructure/readers/prisma-customer-order-reader';
import { PrismaCatalogOrderReader } from './infrastructure/readers/prisma-catalog-order-reader';
import { PrismaRestaurantOrderReader } from './infrastructure/readers/prisma-restaurant-order-reader';
import { DefaultOrderPublicCodeGenerator } from './infrastructure/services/default-order-public-code-generator';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { CreateOrderUseCase } from './application/use-cases/create-order/create-order.use-case';
import { GetOrderDetailsUseCase } from './application/use-cases/get-order-details/get-order-details.use-case';
import { GetMyOrdersUseCase } from './application/use-cases/get-my-orders/get-my-orders.use-case';
import { GetRestaurantOrdersUseCase } from './application/use-cases/get-restaurant-orders/get-restaurant-orders.use-case';
import { AcceptOrderByRestaurantUseCase } from './application/use-cases/accept-order-by-restaurant/accept-order-by-restaurant.use-case';
import { RejectOrderByRestaurantUseCase } from './application/use-cases/reject-order-by-restaurant/reject-order-by-restaurant.use-case';
import { StartOrderPreparationUseCase } from './application/use-cases/start-order-preparation/start-order-preparation.use-case';
import { MarkOrderReadyForPickupUseCase } from './application/use-cases/mark-order-ready-for-pickup/mark-order-ready-for-pickup.use-case';
import { CancelOrderUseCase } from './application/use-cases/cancel-order/cancel-order.use-case';
import { CustomerOrdersController } from './presentation/http/customer-orders.controller';
import { RestaurantOrdersController } from './presentation/http/restaurant-orders.controller';

@Module({
    imports: [IamModule, RestaurantsModule],
    controllers: [CustomerOrdersController, RestaurantOrdersController],
    providers: [
        { provide: ORDER_REPOSITORY, useClass: PrismaOrderRepository },
        { provide: ORDER_STATUS_HISTORY_REPOSITORY, useClass: PrismaOrderStatusHistoryRepository },
        { provide: CUSTOMER_ORDER_READER, useClass: PrismaCustomerOrderReader },
        { provide: CATALOG_ORDER_READER, useClass: PrismaCatalogOrderReader },
        { provide: RESTAURANT_ORDER_READER, useClass: PrismaRestaurantOrderReader },
        { provide: ORDER_PUBLIC_CODE_GENERATOR, useClass: DefaultOrderPublicCodeGenerator },
        { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },
        CreateOrderUseCase,
        GetOrderDetailsUseCase,
        GetMyOrdersUseCase,
        GetRestaurantOrdersUseCase,
        AcceptOrderByRestaurantUseCase,
        RejectOrderByRestaurantUseCase,
        StartOrderPreparationUseCase,
        MarkOrderReadyForPickupUseCase,
        CancelOrderUseCase,
    ],
})
export class OrdersModule {}
