import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { GetRestaurantOrdersUseCase } from '../../application/use-cases/get-restaurant-orders/get-restaurant-orders.use-case';
import { GetRestaurantOrdersCommand } from '../../application/use-cases/get-restaurant-orders/get-restaurant-orders.command';
import { AcceptOrderByRestaurantUseCase } from '../../application/use-cases/accept-order-by-restaurant/accept-order-by-restaurant.use-case';
import { AcceptOrderByRestaurantCommand } from '../../application/use-cases/accept-order-by-restaurant/accept-order-by-restaurant.command';
import { RejectOrderByRestaurantUseCase } from '../../application/use-cases/reject-order-by-restaurant/reject-order-by-restaurant.use-case';
import { RejectOrderByRestaurantCommand } from '../../application/use-cases/reject-order-by-restaurant/reject-order-by-restaurant.command';
import { StartOrderPreparationUseCase } from '../../application/use-cases/start-order-preparation/start-order-preparation.use-case';
import { StartOrderPreparationCommand } from '../../application/use-cases/start-order-preparation/start-order-preparation.command';
import { MarkOrderReadyForPickupUseCase } from '../../application/use-cases/mark-order-ready-for-pickup/mark-order-ready-for-pickup.use-case';
import { MarkOrderReadyForPickupCommand } from '../../application/use-cases/mark-order-ready-for-pickup/mark-order-ready-for-pickup.command';
import { RejectOrderRequestDto } from './dto/reject-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import type { Order } from '../../domain/entities/order.entity';

function mapOrderToResponse(order: Order): Omit<OrderResponseDto, 'statusHistory'> & { statusHistory: [] } {
    return {
        id: order.id.value,
        publicCode: order.publicCode,
        customerId: order.customerId.value,
        restaurantId: order.restaurantId.value,
        courierId: order.courierId?.value ?? null,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        currency: order.currency,
        deliveryAddressText: order.deliveryAddressText,
        customerComment: order.customerComment,
        restaurantComment: order.restaurantComment,
        cancellationReason: order.cancellationReason,
        subtotalPrice: order.subtotalPrice,
        deliveryFee: order.deliveryFee,
        serviceFee: order.serviceFee,
        discountAmount: order.discountAmount,
        totalPrice: order.totalPrice,
        acceptedAt: order.acceptedAt,
        readyAt: order.readyAt,
        pickedUpAt: order.pickedUpAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        items: order.items.map((item) => ({
            id: item.id.value,
            menuItemId: item.menuItemId?.value ?? null,
            nameSnapshot: item.nameSnapshot,
            priceSnapshot: item.priceSnapshot,
            quantity: item.quantity,
            comment: item.comment,
            totalPriceSnapshot: item.totalPriceSnapshot,
            createdAt: item.createdAt,
        })),
        statusHistory: [],
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
}

@ApiTags('Orders — Restaurant')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class RestaurantOrdersController {
    constructor(
        private readonly getRestaurantOrdersUseCase: GetRestaurantOrdersUseCase,
        private readonly acceptOrderUseCase: AcceptOrderByRestaurantUseCase,
        private readonly rejectOrderUseCase: RejectOrderByRestaurantUseCase,
        private readonly startPreparationUseCase: StartOrderPreparationUseCase,
        private readonly markReadyForPickupUseCase: MarkOrderReadyForPickupUseCase,
    ) {}

    @Get('restaurants/:restaurantId/orders')
    @ApiOperation({ summary: 'Get orders for a restaurant' })
    @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
    @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
    @ApiOkResponse({ description: 'List of orders', type: [OrderResponseDto] })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    async getOrders(
        @CurrentUser() user: AuthUser,
        @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
        @Query('status') status?: OrderStatus,
    ) {
        const orders = await this.getRestaurantOrdersUseCase.execute(
            GetRestaurantOrdersCommand.create({
                currentUserId: user.userId,
                restaurantId,
                status,
            }),
        );
        return orders.map(mapOrderToResponse);
    }

    @Patch('restaurant-orders/:orderId/accept')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Accept an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiNoContentResponse({ description: 'Order accepted' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async accept(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<void> {
        return this.acceptOrderUseCase.execute(
            AcceptOrderByRestaurantCommand.create({ currentUserId: user.userId, orderId }),
        );
    }

    @Patch('restaurant-orders/:orderId/reject')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Reject an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiBody({ type: RejectOrderRequestDto })
    @ApiNoContentResponse({ description: 'Order rejected' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async reject(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: RejectOrderRequestDto,
    ): Promise<void> {
        return this.rejectOrderUseCase.execute(
            RejectOrderByRestaurantCommand.create({
                currentUserId: user.userId,
                orderId,
                reason: dto.reason,
            }),
        );
    }

    @Patch('restaurant-orders/:orderId/start-preparation')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Start preparing an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiNoContentResponse({ description: 'Preparation started' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async startPreparation(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<void> {
        return this.startPreparationUseCase.execute(
            StartOrderPreparationCommand.create({ currentUserId: user.userId, orderId }),
        );
    }

    @Patch('restaurant-orders/:orderId/ready-for-pickup')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark order as ready for pickup' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiNoContentResponse({ description: 'Order marked as ready for pickup' })
    @ApiForbiddenResponse({ description: 'Not a staff member of this restaurant' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async markReadyForPickup(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<void> {
        return this.markReadyForPickupUseCase.execute(
            MarkOrderReadyForPickupCommand.create({ currentUserId: user.userId, orderId }),
        );
    }
}
