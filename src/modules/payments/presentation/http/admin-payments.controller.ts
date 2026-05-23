import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import { MarkPaymentPaidUseCase } from '../../application/use-cases/mark-payment-paid/mark-payment-paid.use-case';
import { MarkPaymentPaidCommand } from '../../application/use-cases/mark-payment-paid/mark-payment-paid.command';
import { MarkPaymentFailedUseCase } from '../../application/use-cases/mark-payment-failed/mark-payment-failed.use-case';
import { MarkPaymentFailedCommand } from '../../application/use-cases/mark-payment-failed/mark-payment-failed.command';
import { RefundPaymentUseCase } from '../../application/use-cases/refund-payment/refund-payment.use-case';
import { RefundPaymentCommand } from '../../application/use-cases/refund-payment/refund-payment.command';
import { CancelPaymentUseCase } from '../../application/use-cases/cancel-payment/cancel-payment.use-case';
import { CancelPaymentCommand } from '../../application/use-cases/cancel-payment/cancel-payment.command';
import { MarkPaymentPaidRequestDto } from './dto/mark-payment-paid.request.dto';
import { MarkPaymentFailedRequestDto } from './dto/mark-payment-failed.request.dto';
import { RefundPaymentRequestDto } from './dto/refund-payment.request.dto';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';

@ApiTags('Admin — Payments')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Insufficient permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/payments')
export class AdminPaymentsController {
    constructor(
        private readonly markPaymentPaidUseCase: MarkPaymentPaidUseCase,
        private readonly markPaymentFailedUseCase: MarkPaymentFailedUseCase,
        private readonly refundPaymentUseCase: RefundPaymentUseCase,
        private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    ) {}

    @Patch(':paymentId/paid')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark payment as paid (admin)' })
    @ApiParam({ name: 'paymentId', description: 'Payment UUID' })
    @ApiBody({ type: MarkPaymentPaidRequestDto, required: false })
    @ApiNoContentResponse({ description: 'Payment marked as paid' })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async markPaid(
        @Param('paymentId', ParseUUIDPipe) paymentId: string,
        @Body() dto: MarkPaymentPaidRequestDto,
    ): Promise<void> {
        return this.markPaymentPaidUseCase.execute(
            MarkPaymentPaidCommand.create({
                paymentId,
                providerPaymentId: dto.providerPaymentId,
                paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
            }),
        );
    }

    @Patch(':paymentId/failed')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark payment as failed (admin)' })
    @ApiParam({ name: 'paymentId', description: 'Payment UUID' })
    @ApiBody({ type: MarkPaymentFailedRequestDto })
    @ApiNoContentResponse({ description: 'Payment marked as failed' })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async markFailed(
        @Param('paymentId', ParseUUIDPipe) paymentId: string,
        @Body() dto: MarkPaymentFailedRequestDto,
    ): Promise<void> {
        return this.markPaymentFailedUseCase.execute(
            MarkPaymentFailedCommand.create({ paymentId, reason: dto.reason }),
        );
    }

    @Patch(':paymentId/refund')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Refund a payment (admin)' })
    @ApiParam({ name: 'paymentId', description: 'Payment UUID' })
    @ApiBody({ type: RefundPaymentRequestDto, required: false })
    @ApiNoContentResponse({ description: 'Payment refunded' })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    @ApiConflictResponse({ description: 'Payment cannot be refunded in current state' })
    async refund(
        @CurrentUser() user: AuthUser,
        @Param('paymentId', ParseUUIDPipe) paymentId: string,
        @Body() dto: RefundPaymentRequestDto,
    ): Promise<void> {
        return this.refundPaymentUseCase.execute(
            RefundPaymentCommand.create({
                paymentId,
                actorUserId: user.userId,
                reason: dto.reason,
            }),
        );
    }

    @Patch(':paymentId/cancel')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Cancel a payment (admin)' })
    @ApiParam({ name: 'paymentId', description: 'Payment UUID' })
    @ApiNoContentResponse({ description: 'Payment cancelled' })
    @ApiNotFoundResponse({ description: 'Payment not found' })
    @ApiConflictResponse({ description: 'Invalid status transition' })
    async cancel(@Param('paymentId', ParseUUIDPipe) paymentId: string): Promise<void> {
        return this.cancelPaymentUseCase.execute(CancelPaymentCommand.create({ paymentId }));
    }
}
