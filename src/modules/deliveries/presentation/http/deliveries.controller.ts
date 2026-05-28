import {
    Body,
    Controller,
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
import { AssignCourierToOrderUseCase } from '../../application/use-cases/assign-courier-to-order/assign-courier-to-order.use-case';
import { AssignCourierToOrderCommand } from '../../application/use-cases/assign-courier-to-order/assign-courier-to-order.command';
import { ReportDeliveryProblemUseCase } from '../../application/use-cases/report-delivery-problem/report-delivery-problem.use-case';
import { ReportDeliveryProblemCommand } from '../../application/use-cases/report-delivery-problem/report-delivery-problem.command';
import { AssignCourierToOrderDto } from './dto/assign-courier-to-order.dto';
import { ReportDeliveryProblemDto } from './dto/report-delivery-problem.dto';
import { DeliveryResponseDto } from './dto/delivery.response.dto';
import { DeliveryProblemReportResponseDto } from './dto/delivery-problem-report.response.dto';

@ApiTags('Deliveries')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
    constructor(
        private readonly assignCourierUseCase: AssignCourierToOrderUseCase,
        private readonly reportProblemUseCase: ReportDeliveryProblemUseCase,
    ) {}

    @Patch('orders/:orderId/assign-courier')
    @ApiOperation({ summary: 'Assign courier to a READY_FOR_PICKUP order' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiNoContentResponse({ type: DeliveryResponseDto })
    @ApiForbiddenResponse({ description: 'Not a restaurant manager or admin' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiConflictResponse({ description: 'Order not ready or courier not available' })
    async assignCourier(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: AssignCourierToOrderDto,
    ): Promise<DeliveryResponseDto> {
        const result = await this.assignCourierUseCase.execute(
            AssignCourierToOrderCommand.create({
                actorUserId: user.userId,
                actorRole: user.role,
                orderId,
                courierProfileId: dto.courierProfileId,
            }),
        );
        return DeliveryResponseDto.fromView(result);
    }

    @Post('orders/:orderId/problems')
    @ApiOperation({ summary: 'Report a delivery problem' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiCreatedResponse({ type: DeliveryProblemReportResponseDto })
    @ApiForbiddenResponse({ description: 'Not authorized to report for this order' })
    @ApiNotFoundResponse({ description: 'Order not found' })
    async reportProblem(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: ReportDeliveryProblemDto,
    ): Promise<DeliveryProblemReportResponseDto> {
        const report = await this.reportProblemUseCase.execute(
            ReportDeliveryProblemCommand.create({
                reporterUserId: user.userId,
                reporterRole: user.role,
                orderId,
                type: dto.type,
                description: dto.description,
            }),
        );
        return DeliveryProblemReportResponseDto.from(report);
    }
}
