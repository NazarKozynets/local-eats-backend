import {
    Body,
    Controller,
    Get,
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
import { CreateOrderUseCase } from '../../application/use-cases/create-order/create-order.use-case';
import { CreateOrderCommand } from '../../application/use-cases/create-order/create-order.command';
import { GetOrderDetailsUseCase } from '../../application/use-cases/get-order-details/get-order-details.use-case';
import { GetOrderDetailsCommand } from '../../application/use-cases/get-order-details/get-order-details.command';
import { GetMyOrdersUseCase } from '../../application/use-cases/get-my-orders/get-my-orders.use-case';
import { GetMyOrdersCommand } from '../../application/use-cases/get-my-orders/get-my-orders.command';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order/cancel-order.use-case';
import { CancelOrderCommand } from '../../application/use-cases/cancel-order/cancel-order.command';
import { CreateOrderRequestDto } from './dto/create-order.request.dto';
import { CancelOrderRequestDto } from './dto/cancel-order.request.dto';
import { OrderResponseDto } from './dto/order.response.dto';
import type { Order } from '../../domain/entities/order.entity';
import type { OrderDetailsResult } from '../../application/use-cases/get-order-details/get-order-details.result';

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

@ApiTags('Orders — Customer')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class CustomerOrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly getOrderDetailsUseCase: GetOrderDetailsUseCase,
        private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
        private readonly cancelOrderUseCase: CancelOrderUseCase,
    ) {}

    @Post('orders')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new order' })
    @ApiBody({ type: CreateOrderRequestDto })
    @ApiCreatedResponse({ description: 'Order created successfully' })
    @ApiNotFoundResponse({ description: 'Customer profile or delivery address not found' })
    @ApiForbiddenResponse({ description: 'Delivery address does not belong to your profile' })
    @ApiConflictResponse({ description: 'Restaurant not active or item not available' })
    async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderRequestDto): Promise<{ id: string }> {
        const result = await this.createOrderUseCase.execute(
            CreateOrderCommand.create({
                currentUserId: user.userId,
                restaurantId: dto.restaurantId,
                customerAddressId: dto.customerAddressId,
                paymentMethod: dto.paymentMethod,
                customerComment: dto.customerComment,
                items: dto.items.map((i) => ({
                    menuItemId: i.menuItemId,
                    quantity: i.quantity,
                    comment: i.comment,
                })),
            }),
        );
        return { id: result.orderId };
    }

    @Get('orders/my')
    @ApiOperation({ summary: 'Get my orders' })
    @ApiOkResponse({ description: 'List of current customer orders', type: [OrderResponseDto] })
    @ApiNotFoundResponse({ description: 'Customer profile not found' })
    async getMyOrders(@CurrentUser() user: AuthUser) {
        const orders = await this.getMyOrdersUseCase.execute(
            GetMyOrdersCommand.create({ currentUserId: user.userId }),
        );
        return orders.map(mapOrderToResponse);
    }

    @Get('orders/:orderId')
    @ApiOperation({ summary: 'Get order details' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiOkResponse({ description: 'Order details', type: OrderResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiForbiddenResponse({ description: 'Access denied' })
    async getDetails(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<OrderDetailsResult> {
        return this.getOrderDetailsUseCase.execute(
            GetOrderDetailsCommand.create({ currentUserId: user.userId, orderId }),
        );
    }

    @Patch('orders/:orderId/cancel')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Cancel an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiBody({ type: CancelOrderRequestDto })
    @ApiConflictResponse({ description: 'Order cannot be cancelled in current status' })
    @ApiForbiddenResponse({ description: 'Order does not belong to you' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async cancel(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: CancelOrderRequestDto,
    ): Promise<void> {
        return this.cancelOrderUseCase.execute(
            CancelOrderCommand.create({
                currentUserId: user.userId,
                orderId,
                reason: dto.reason,
            }),
        );
    }
}
