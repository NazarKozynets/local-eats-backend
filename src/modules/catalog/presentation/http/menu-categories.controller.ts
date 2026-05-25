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
import { CreateMenuCategoryUseCase } from '../../application/use-cases/create-menu-category/create-menu-category.use-case';
import { CreateMenuCategoryCommand } from '../../application/use-cases/create-menu-category/create-menu-category.command';
import { UpdateMenuCategoryUseCase } from '../../application/use-cases/update-menu-category/update-menu-category.use-case';
import { UpdateMenuCategoryCommand } from '../../application/use-cases/update-menu-category/update-menu-category.command';
import { DeleteMenuCategoryUseCase } from '../../application/use-cases/delete-menu-category/delete-menu-category.use-case';
import { DeleteMenuCategoryCommand } from '../../application/use-cases/delete-menu-category/delete-menu-category.command';
import { CreateMenuCategoryRequestDto } from './dto/create-menu-category.request.dto';
import { UpdateMenuCategoryRequestDto } from './dto/update-menu-category.request.dto';

@ApiTags('Catalog — Categories')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class MenuCategoriesController {
    constructor(
        private readonly createMenuCategoryUseCase: CreateMenuCategoryUseCase,
        private readonly updateMenuCategoryUseCase: UpdateMenuCategoryUseCase,
        private readonly deleteMenuCategoryUseCase: DeleteMenuCategoryUseCase,
    ) {}

    @Post('restaurants/:restaurantId/catalog/categories')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a menu category for a restaurant' })
    @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
    @ApiBody({ type: CreateMenuCategoryRequestDto })
    @ApiCreatedResponse({ description: 'Category created successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiConflictResponse({ description: 'Category with this name already exists' })
    async create(
        @CurrentUser() user: AuthUser,
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
        @Body() dto: CreateMenuCategoryRequestDto,
    ): Promise<void> {
        return this.createMenuCategoryUseCase.execute(
            CreateMenuCategoryCommand.create({
                currentUserId: user.userId,
                restaurantId,
                name: dto.name,
                position: dto.position,
            }),
        );
    }

    @Patch('catalog/categories/:categoryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update a menu category' })
    @ApiParam({ name: 'categoryId', description: 'Category UUID' })
    @ApiBody({ type: UpdateMenuCategoryRequestDto })
    @ApiNoContentResponse({ description: 'Updated successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    async update(
        @CurrentUser() user: AuthUser,
        @Param('categoryId', ParseUUIDPipe) categoryId: string,
        @Body() dto: UpdateMenuCategoryRequestDto,
    ): Promise<void> {
        return this.updateMenuCategoryUseCase.execute(
            UpdateMenuCategoryCommand.create({
                currentUserId: user.userId,
                categoryId,
                name: dto.name,
                position: dto.position,
                isActive: dto.isActive,
            }),
        );
    }

    @Delete('catalog/categories/:categoryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a menu category' })
    @ApiParam({ name: 'categoryId', description: 'Category UUID' })
    @ApiNoContentResponse({ description: 'Deleted successfully' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiConflictResponse({ description: 'Category still has items' })
    async delete(
        @CurrentUser() user: AuthUser,
        @Param('categoryId', ParseUUIDPipe) categoryId: string,
    ): Promise<void> {
        return this.deleteMenuCategoryUseCase.execute(
            DeleteMenuCategoryCommand.create({
                currentUserId: user.userId,
                categoryId,
            }),
        );
    }
}
