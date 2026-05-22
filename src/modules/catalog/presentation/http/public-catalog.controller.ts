import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { GetPublicRestaurantCatalogUseCase } from '../../application/use-cases/get-public-restaurant-catalog/get-public-restaurant-catalog.use-case';
import { GetPublicRestaurantCatalogCommand } from '../../application/use-cases/get-public-restaurant-catalog/get-public-restaurant-catalog.command';
import { RestaurantCatalogResponseDto } from './dto/restaurant-catalog.response.dto';
import type { CatalogReadModel } from '../../application/ports/catalog-reader.port';

@ApiTags('Catalog — Public')
export class PublicCatalogController {
    constructor(
        private readonly getPublicRestaurantCatalogUseCase: GetPublicRestaurantCatalogUseCase,
    ) {}

    @Get('public/restaurants/:restaurantId/catalog')
    @ApiOperation({ summary: 'Get public catalog (active categories and non-hidden items)' })
    @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
    @ApiOkResponse({ type: RestaurantCatalogResponseDto })
    @ApiNotFoundResponse({ description: 'Restaurant not active or not found' })
    async getPublicCatalog(
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    ): Promise<CatalogReadModel> {
        return this.getPublicRestaurantCatalogUseCase.execute(
            GetPublicRestaurantCatalogCommand.create({ restaurantId }),
        );
    }
}
