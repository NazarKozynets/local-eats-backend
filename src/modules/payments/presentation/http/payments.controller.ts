import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiConflictResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment/create-payment.use-case';
import { CreatePaymentCommand } from '../../application/use-cases/create-payment/create-payment.command';
import { GetPaymentByOrderUseCase } from '../../application/use-cases/get-payment-by-order/get-payment-by-order.use-case';
import { GetPaymentByOrderCommand } from '../../application/use-cases/get-payment-by-order/get-payment-by-order.command';
import { PaymentResponseDto } from './dto/payment.response.dto';
import type { GetPaymentByOrderResult } from '../../application/use-cases/get-payment-by-order/get-payment-by-order.result';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller()
export class PaymentsController {
    constructor(
        private readonly createPaymentUseCase: CreatePaymentUseCase,
        private readonly getPaymentByOrderUseCase: GetPaymentByOrderUseCase,
    ) {}

    @Post('payments/orders/:orderId')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a payment for an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiCreatedResponse({ description: 'Payment created successfully' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiForbiddenResponse({ description: 'Access denied to this order' })
    @ApiConflictResponse({ description: 'Payment already exists or order not payable' })
    async create(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<void> {
        return this.createPaymentUseCase.execute(
            CreatePaymentCommand.create({ currentUserId: user.userId, orderId }),
        );
    }

    @Get('payments/orders/:orderId')
    @ApiOperation({ summary: 'Get payment for an order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiOkResponse({ description: 'Payment details', type: PaymentResponseDto })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    @ApiForbiddenResponse({ description: 'Access denied' })
    async getByOrder(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<GetPaymentByOrderResult> {
        return this.getPaymentByOrderUseCase.execute(
            GetPaymentByOrderCommand.create({ currentUserId: user.userId, orderId }),
        );
    }
}
