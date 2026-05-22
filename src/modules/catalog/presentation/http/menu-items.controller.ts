import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreateMenuItemUseCase } from '../../application/use-cases/create-menu-item/create-menu-item.use-case';
import { CreateMenuItemCommand } from '../../application/use-cases/create-menu-item/create-menu-item.command';
import { UpdateMenuItemUseCase } from '../../application/use-cases/update-menu-item/update-menu-item.use-case';
import { UpdateMenuItemCommand } from '../../application/use-cases/update-menu-item/update-menu-item.command';
import { ChangeMenuItemStatusUseCase } from '../../application/use-cases/change-menu-item-status/change-menu-item-status.use-case';
import { ChangeMenuItemStatusCommand } from '../../application/use-cases/change-menu-item-status/change-menu-item-status.command';
import { DeleteMenuItemUseCase } from '../../application/use-cases/delete-menu-item/delete-menu-item.use-case';
import { DeleteMenuItemCommand } from '../../application/use-cases/delete-menu-item/delete-menu-item.command';
import { CreateMenuItemRequestDto } from './dto/create-menu-item.request.dto';
import { UpdateMenuItemRequestDto } from './dto/update-menu-item.request.dto';
import { ChangeMenuItemStatusRequestDto } from './dto/change-menu-item-status.request.dto';

@ApiTags('Catalog — Items')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
export class MenuItemsController {
    constructor(
        private readonly createMenuItemUseCase: CreateMenuItemUseCase,
        private readonly updateMenuItemUseCase: UpdateMenuItemUseCase,
        private readonly changeMenuItemStatusUseCase: ChangeMenuItemStatusUseCase,
        private readonly deleteMenuItemUseCase: DeleteMenuItemUseCase,
    ) {}

    @Post('restaurants/:restaurantId/catalog/items')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a menu item for a restaurant' })
    @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
    @ApiBody({ type: CreateMenuItemRequestDto })
    @ApiCreatedResponse({ description: 'Item created successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Category not found or belongs to another restaurant' })
    async create(
        @CurrentUser() user: AuthUser,
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
        @Body() dto: CreateMenuItemRequestDto,
    ): Promise<void> {
        return this.createMenuItemUseCase.execute(
            CreateMenuItemCommand.create({
                currentUserId: user.userId,
                restaurantId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                imageUrl: dto.imageUrl,
                price: dto.price,
                weightGrams: dto.weightGrams,
                estimatedCookTime: dto.estimatedCookTime,
                isPopular: dto.isPopular,
            }),
        );
    }

    @Patch('catalog/items/:menuItemId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update a menu item' })
    @ApiParam({ name: 'menuItemId', description: 'Menu item UUID' })
    @ApiBody({ type: UpdateMenuItemRequestDto })
    @ApiNoContentResponse({ description: 'Updated successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Menu item or target category not found' })
    async update(
        @CurrentUser() user: AuthUser,
        @Param('menuItemId', ParseUUIDPipe) menuItemId: string,
        @Body() dto: UpdateMenuItemRequestDto,
    ): Promise<void> {
        return this.updateMenuItemUseCase.execute(
            UpdateMenuItemCommand.create({
                currentUserId: user.userId,
                menuItemId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                imageUrl: dto.imageUrl,
                price: dto.price,
                weightGrams: dto.weightGrams,
                estimatedCookTime: dto.estimatedCookTime,
                isPopular: dto.isPopular,
            }),
        );
    }

    @Patch('catalog/items/:menuItemId/status')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Change menu item status' })
    @ApiParam({ name: 'menuItemId', description: 'Menu item UUID' })
    @ApiBody({ type: ChangeMenuItemStatusRequestDto })
    @ApiNoContentResponse({ description: 'Status changed successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Menu item not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async changeStatus(
        @CurrentUser() user: AuthUser,
        @Param('menuItemId', ParseUUIDPipe) menuItemId: string,
        @Body() dto: ChangeMenuItemStatusRequestDto,
    ): Promise<void> {
        return this.changeMenuItemStatusUseCase.execute(
            ChangeMenuItemStatusCommand.create({
                currentUserId: user.userId,
                menuItemId,
                status: dto.status,
            }),
        );
    }

    @Delete('catalog/items/:menuItemId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete (hide) a menu item' })
    @ApiParam({ name: 'menuItemId', description: 'Menu item UUID' })
    @ApiNoContentResponse({ description: 'Item hidden successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Menu item not found' })
    async delete(
        @CurrentUser() user: AuthUser,
        @Param('menuItemId', ParseUUIDPipe) menuItemId: string,
    ): Promise<void> {
        return this.deleteMenuItemUseCase.execute(
            DeleteMenuItemCommand.create({
                currentUserId: user.userId,
                menuItemId,
            }),
        );
    }
}
