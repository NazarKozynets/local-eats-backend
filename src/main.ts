import { NestFactory } from '@nestjs/core';
import {ConfigService} from "@nestjs/config";
import { AppModule } from './app.module';
import { IamModule } from './modules/iam/iam.module';
import { setupModuleSwagger } from './shared/infrastructure/swagger/setup-module-swagger';
import {CustomersModule} from "./modules/customers/customers.module";

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

  // setupModuleSwagger(app, {
  //   path: 'customer/docs',
  //   title: 'CUSTOMER API',
  //   description: 'Customers API documentation',
  //   version: '1.0',
  //   include: [CustomersModule],
  // })

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("app.port");

  await app.listen(port);
}
bootstrap();
