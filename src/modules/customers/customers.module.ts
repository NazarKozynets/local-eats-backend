import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { CUSTOMER_PROFILE_REPOSITORY } from './application/ports/customer-profile.repository.port';
import { CUSTOMER_ADDRESS_REPOSITORY } from './application/ports/customer-address.repository.port';
import { PrismaCustomerProfileRepository } from './infrastructure/persistence/prisma-customer-profile.repository';
import { PrismaCustomerAddressRepository } from './infrastructure/persistence/prisma-customer-address.repository';
import { CreateCustomerProfileUseCase } from './application/use-cases/create-customer-profile/create-customer-profile.use-case';
import { GetMyCustomerProfileUseCase } from './application/use-cases/get-my-customer-profile/get-my-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from './application/use-cases/update-customer-profile/update-customer-profile.use-case';
import { GetMyCustomerAddressesUseCase } from './application/use-cases/get-my-customer-addresses/get-my-customer-addresses.use-case';
import { AddCustomerAddressUseCase } from './application/use-cases/add-customer-address/add-customer-address.use-case';
import { UpdateCustomerAddressUseCase } from './application/use-cases/update-customer-address/update-customer-address.use-case';
import { DeleteCustomerAddressUseCase } from './application/use-cases/delete-customer-address/delete-customer-address.use-case';
import { SetDefaultCustomerAddressUseCase } from './application/use-cases/set-default-customer-address/set-default-customer-address.use-case';
import { CustomerProfileController } from './presentation/controllers/customer-profile.controller';
import { CustomerAddressesController } from './presentation/controllers/customer-addresses.controller';

@Module({
    imports: [IamModule],
    controllers: [CustomerProfileController, CustomerAddressesController],
    providers: [
        {
            provide: CUSTOMER_PROFILE_REPOSITORY,
            useClass: PrismaCustomerProfileRepository,
        },
        {
            provide: CUSTOMER_ADDRESS_REPOSITORY,
            useClass: PrismaCustomerAddressRepository,
        },
        CreateCustomerProfileUseCase,
        GetMyCustomerProfileUseCase,
        UpdateCustomerProfileUseCase,
        GetMyCustomerAddressesUseCase,
        AddCustomerAddressUseCase,
        UpdateCustomerAddressUseCase,
        DeleteCustomerAddressUseCase,
        SetDefaultCustomerAddressUseCase,
    ],
})
export class CustomersModule {}
