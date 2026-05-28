import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../../iam/presentation/guards/roles.guard';
import { Roles } from '../../../iam/presentation/decorators/roles.decorator';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import { UserRole } from '../../../iam/domain/enums/user-role.enum';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { AcceptDeliveryUseCase } from '../../application/use-cases/accept-delivery/accept-delivery.use-case';
import { AcceptDeliveryCommand } from '../../application/use-cases/accept-delivery/accept-delivery.command';
import { RejectDeliveryUseCase } from '../../application/use-cases/reject-delivery/reject-delivery.use-case';
import { RejectDeliveryCommand } from '../../application/use-cases/reject-delivery/reject-delivery.command';
import { MarkOrderPickedUpUseCase } from '../../application/use-cases/mark-order-picked-up/mark-order-picked-up.use-case';
import { MarkOrderPickedUpCommand } from '../../application/use-cases/mark-order-picked-up/mark-order-picked-up.command';
import { StartDeliveryUseCase } from '../../application/use-cases/start-delivery/start-delivery.use-case';
import { StartDeliveryCommand } from '../../application/use-cases/start-delivery/start-delivery.command';
import { MarkOrderDeliveredUseCase } from '../../application/use-cases/mark-order-delivered/mark-order-delivered.use-case';
import { MarkOrderDeliveredCommand } from '../../application/use-cases/mark-order-delivered/mark-order-delivered.command';
import { GetMyActiveDeliveryUseCase } from '../../application/use-cases/get-my-active-delivery/get-my-active-delivery.use-case';
import { GetMyActiveDeliveryCommand } from '../../application/use-cases/get-my-active-delivery/get-my-active-delivery.command';
import { GetDeliveryDetailsUseCase } from '../../application/use-cases/get-delivery-details/get-delivery-details.use-case';
import { GetDeliveryDetailsCommand } from '../../application/use-cases/get-delivery-details/get-delivery-details.command';
import { UpdateDeliveryLocationUseCase } from '../../application/use-cases/update-delivery-location/update-delivery-location.use-case';
import { UpdateDeliveryLocationCommand } from '../../application/use-cases/update-delivery-location/update-delivery-location.command';
import { RejectDeliveryDto } from './dto/reject-delivery.dto';
import { UpdateDeliveryLocationDto } from './dto/update-delivery-location.dto';
import { DeliveryResponseDto } from './dto/delivery.response.dto';

@ApiTags('Courier — Deliveries')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Requires COURIER role' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COURIER)
@Controller('courier/deliveries')
export class CourierDeliveriesController {
    constructor(
        private readonly getActiveDeliveryUseCase: GetMyActiveDeliveryUseCase,
        private readonly getDetailsUseCase: GetDeliveryDetailsUseCase,
        private readonly acceptDeliveryUseCase: AcceptDeliveryUseCase,
        private readonly rejectDeliveryUseCase: RejectDeliveryUseCase,
        private readonly pickUpUseCase: MarkOrderPickedUpUseCase,
        private readonly startDeliveryUseCase: StartDeliveryUseCase,
        private readonly deliveredUseCase: MarkOrderDeliveredUseCase,
        private readonly updateLocationUseCase: UpdateDeliveryLocationUseCase,
    ) {}

    @Get('active')
    @ApiOperation({ summary: 'Get current courier active delivery' })
    @ApiOkResponse({ type: DeliveryResponseDto, nullable: true })
    async getActiveDelivery(@CurrentUser() user: AuthUser): Promise<DeliveryResponseDto | null> {
        const view = await this.getActiveDeliveryUseCase.execute(
            GetMyActiveDeliveryCommand.create({ currentUserId: user.userId }),
        );
        return view ? DeliveryResponseDto.fromView(view) : null;
    }

    @Get(':orderId')
    @ApiOperation({ summary: 'Get delivery details' })
    @ApiParam({ name: 'orderId', description: 'Order UUID' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    @ApiNotFoundResponse()
    async getDetails(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<DeliveryResponseDto> {
        const view = await this.getDetailsUseCase.execute(
            GetDeliveryDetailsCommand.create({ currentUserId: user.userId, currentUserRole: user.role, orderId }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/accept')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Accept assigned delivery' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    async accept(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<DeliveryResponseDto> {
        const view = await this.acceptDeliveryUseCase.execute(
            AcceptDeliveryCommand.create({ currentUserId: user.userId, orderId }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/reject')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reject assigned delivery' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    async reject(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: RejectDeliveryDto,
    ): Promise<DeliveryResponseDto> {
        const view = await this.rejectDeliveryUseCase.execute(
            RejectDeliveryCommand.create({ currentUserId: user.userId, orderId, reason: dto.reason }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/pick-up')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark order as picked up' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    async pickUp(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<DeliveryResponseDto> {
        const view = await this.pickUpUseCase.execute(
            MarkOrderPickedUpCommand.create({ currentUserId: user.userId, orderId }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/start')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Start delivery (PICKED_UP → DELIVERING)' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    async start(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<DeliveryResponseDto> {
        const view = await this.startDeliveryUseCase.execute(
            StartDeliveryCommand.create({ currentUserId: user.userId, orderId }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/delivered')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark order as delivered' })
    @ApiOkResponse({ type: DeliveryResponseDto })
    async delivered(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<DeliveryResponseDto> {
        const view = await this.deliveredUseCase.execute(
            MarkOrderDeliveredCommand.create({ currentUserId: user.userId, orderId }),
        );
        return DeliveryResponseDto.fromView(view);
    }

    @Patch(':orderId/location')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update courier location for active delivery' })
    @ApiNoContentResponse()
    async updateLocation(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() dto: UpdateDeliveryLocationDto,
    ): Promise<void> {
        return this.updateLocationUseCase.execute(
            UpdateDeliveryLocationCommand.create({
                currentUserId: user.userId,
                orderId,
                latitude: dto.latitude,
                longitude: dto.longitude,
            }),
        );
    }
}
