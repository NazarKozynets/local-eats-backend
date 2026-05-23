import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {APP_FILTER} from "@nestjs/core";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { IamModule } from './modules/iam/iam.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CouriersModule } from './modules/couriers/couriers.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import {DomainExceptionFilter} from "./shared/infrastructure/http/filters/domain-exception.filter";
import {GlobalExceptionFilter} from "./shared/infrastructure/http/filters/global-exception.filter";
import {DomainExceptionMapper} from "./shared/infrastructure/http/mappers/domain-exception.mapper";
import {configurations} from "./config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
    }),
    DatabaseModule,
    IamModule,
    CustomersModule,
    RestaurantsModule,
    CatalogModule,
    OrdersModule,
    CouriersModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DomainExceptionMapper,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
