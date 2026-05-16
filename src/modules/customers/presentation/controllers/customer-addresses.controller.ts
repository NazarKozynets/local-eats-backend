import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { GetMyCustomerAddressesUseCase } from '../../application/use-cases/get-my-customer-addresses/get-my-customer-addresses.use-case';
import { AddCustomerAddressUseCase } from '../../application/use-cases/add-customer-address/add-customer-address.use-case';
import { UpdateCustomerAddressUseCase } from '../../application/use-cases/update-customer-address/update-customer-address.use-case';
import { DeleteCustomerAddressUseCase } from '../../application/use-cases/delete-customer-address/delete-customer-address.use-case';
import { SetDefaultCustomerAddressUseCase } from '../../application/use-cases/set-default-customer-address/set-default-customer-address.use-case';
import { GetMyCustomerAddressesCommand } from '../../application/use-cases/get-my-customer-addresses/get-my-customer-addresses.command';
import { AddCustomerAddressCommand } from '../../application/use-cases/add-customer-address/add-customer-address.command';
import { UpdateCustomerAddressCommand } from '../../application/use-cases/update-customer-address/update-customer-address.command';
import { DeleteCustomerAddressCommand } from '../../application/use-cases/delete-customer-address/delete-customer-address.command';
import { SetDefaultCustomerAddressCommand } from '../../application/use-cases/set-default-customer-address/set-default-customer-address.command';
import { AddCustomerAddressRequestDto } from '../dto/add-customer-address.request.dto';
import { UpdateCustomerAddressRequestDto } from '../dto/update-customer-address.request.dto';

@Controller('customers/me/addresses')
@UseGuards(JwtAuthGuard)
@ApiTags('Customer Addresses')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class CustomerAddressesController {
    constructor(
        private readonly getMyCustomerAddressesUseCase: GetMyCustomerAddressesUseCase,
        private readonly addCustomerAddressUseCase: AddCustomerAddressUseCase,
        private readonly updateCustomerAddressUseCase: UpdateCustomerAddressUseCase,
        private readonly deleteCustomerAddressUseCase: DeleteCustomerAddressUseCase,
        private readonly setDefaultCustomerAddressUseCase: SetDefaultCustomerAddressUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List my delivery addresses' })
    @ApiOkResponse({ description: 'List of customer addresses' })
    @ApiNotFoundResponse({ description: 'Customer profile not found' })
    async list(@CurrentUser() user: AuthUser) {
        return this.getMyCustomerAddressesUseCase.execute(
            GetMyCustomerAddressesCommand.create({ userId: user.userId }),
        );
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add a delivery address' })
    @ApiBody({ type: AddCustomerAddressRequestDto })
    @ApiCreatedResponse({ description: 'Address added successfully' })
    @ApiNotFoundResponse({ description: 'Customer profile not found' })
    async add(
        @CurrentUser() user: AuthUser,
        @Body() dto: AddCustomerAddressRequestDto,
    ): Promise<void> {
        return this.addCustomerAddressUseCase.execute(
            AddCustomerAddressCommand.create({
                userId: user.userId,
                label: dto.label,
                city: dto.city,
                street: dto.street,
                building: dto.building,
                apartment: dto.apartment,
                entrance: dto.entrance,
                floor: dto.floor,
                comment: dto.comment,
                isDefault: dto.isDefault,
            }),
        );
    }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update a delivery address' })
    @ApiParam({ name: 'id', description: 'Address UUID' })
    @ApiBody({ type: UpdateCustomerAddressRequestDto })
    @ApiNoContentResponse({ description: 'Address updated successfully' })
    @ApiNotFoundResponse({ description: 'Customer profile or address not found' })
    @ApiForbiddenResponse({ description: 'Address does not belong to this customer' })
    async update(
        @CurrentUser() user: AuthUser,
        @Param('id') addressId: string,
        @Body() dto: UpdateCustomerAddressRequestDto,
    ): Promise<void> {
        return this.updateCustomerAddressUseCase.execute(
            UpdateCustomerAddressCommand.create({
                userId: user.userId,
                addressId,
                label: dto.label,
                city: dto.city,
                street: dto.street,
                building: dto.building,
                apartment: dto.apartment,
                entrance: dto.entrance,
                floor: dto.floor,
                comment: dto.comment,
            }),
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a delivery address' })
    @ApiParam({ name: 'id', description: 'Address UUID' })
    @ApiNoContentResponse({ description: 'Address deleted successfully' })
    @ApiNotFoundResponse({ description: 'Customer profile or address not found' })
    @ApiForbiddenResponse({ description: 'Address does not belong to this customer' })
    async remove(
        @CurrentUser() user: AuthUser,
        @Param('id') addressId: string,
    ): Promise<void> {
        return this.deleteCustomerAddressUseCase.execute(
            DeleteCustomerAddressCommand.create({ userId: user.userId, addressId }),
        );
    }

    @Patch(':id/default')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Set an address as the default delivery address' })
    @ApiParam({ name: 'id', description: 'Address UUID' })
    @ApiNoContentResponse({ description: 'Default address updated' })
    @ApiNotFoundResponse({ description: 'Customer profile or address not found' })
    @ApiForbiddenResponse({ description: 'Address does not belong to this customer' })
    async setDefault(
        @CurrentUser() user: AuthUser,
        @Param('id') addressId: string,
    ): Promise<void> {
        return this.setDefaultCustomerAddressUseCase.execute(
            SetDefaultCustomerAddressCommand.create({ userId: user.userId, addressId }),
        );
    }
}
