import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { GetRestaurantCatalogUseCase } from '../../application/use-cases/get-restaurant-catalog/get-restaurant-catalog.use-case';
import { GetRestaurantCatalogCommand } from '../../application/use-cases/get-restaurant-catalog/get-restaurant-catalog.command';
import { RestaurantCatalogResponseDto } from './dto/restaurant-catalog.response.dto';
import type { CatalogReadModel } from '../../application/ports/catalog-reader.port';

@ApiTags('Catalog — Manager')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class ManagerCatalogController {
    constructor(
        private readonly getRestaurantCatalogUseCase: GetRestaurantCatalogUseCase,
    ) {}

    @Get('restaurants/:restaurantId/catalog')
    @ApiOperation({ summary: 'Get full manager catalog including hidden/unavailable items' })
    @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
    @ApiOkResponse({ type: RestaurantCatalogResponseDto })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    async getManagerCatalog(
        @CurrentUser() user: AuthUser,
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    ): Promise<CatalogReadModel> {
        return this.getRestaurantCatalogUseCase.execute(
            GetRestaurantCatalogCommand.create({
                currentUserId: user.userId,
                restaurantId,
            }),
        );
    }
}
