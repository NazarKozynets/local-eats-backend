import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { IamModule } from './modules/iam/iam.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CouriersModule } from './modules/couriers/couriers.module';
import { setupModuleSwagger } from './shared/infrastructure/swagger/setup-module-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  setupModuleSwagger(app, {
    path: 'iam/docs',
    title: 'IAM API',
    description: 'Identity and Access Management API documentation',
    version: '1.0',
    include: [IamModule],
  });

  setupModuleSwagger(app, {
    path: 'customer/docs',
    title: 'Customer API',
    description: 'Customers API documentation',
    version: '1.0',
    include: [CustomersModule],
  });

  setupModuleSwagger(app, {
    path: 'restaurants/docs',
    title: 'Restaurants API',
    description: 'Restaurants API documentation',
    version: '1.0',
    include: [RestaurantsModule],
  });

  setupModuleSwagger(app, {
    path: 'catalog/docs',
    title: 'Catalog API',
    description: 'Catalog API documentation',
    version: '1.0',
    include: [CatalogModule],
  });

  setupModuleSwagger(app, {
    path: 'orders/docs',
    title: 'Orders API',
    description: 'Orders API documentation',
    version: '1.0',
    include: [OrdersModule],
  });

  setupModuleSwagger(app, {
    path: 'couriers/docs',
    title: 'Couriers API',
    description: 'Couriers API documentation',
    version: '1.0',
    include: [CouriersModule],
  });

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("app.port");

  await app.listen(port);
}
bootstrap();
