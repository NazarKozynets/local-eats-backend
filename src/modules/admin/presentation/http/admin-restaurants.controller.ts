import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { GetAdminRestaurantsUseCase } from '../../application/use-cases/get-admin-restaurants/get-admin-restaurants.use-case';
import { AdminRestaurantsQueryDto } from './dto/admin-list-query.dto';
import { AdminRestaurantResponseDto } from './dto/admin-response.dtos';

@Controller('admin/restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Admin — Restaurants')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'User does not have ADMIN role' })
export class AdminRestaurantsListController {
    constructor(
        private readonly getAdminRestaurantsUseCase: GetAdminRestaurantsUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'List all restaurants with optional filters' })
    @ApiOkResponse({ type: [AdminRestaurantResponseDto] })
    async getRestaurants(@Query() query: AdminRestaurantsQueryDto): Promise<AdminRestaurantResponseDto[]> {
        const restaurants = await this.getAdminRestaurantsUseCase.execute(query);
        return restaurants.map(AdminRestaurantResponseDto.from);
    }
}
