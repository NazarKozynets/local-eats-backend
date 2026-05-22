import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { Currency } from '../../../domain/enums/currency.enum';
import { OrderItemResponseDto } from './order-item.response.dto';
import { OrderStatusHistoryResponseDto } from './order-status-history.response.dto';

export class OrderResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() publicCode!: string;
    @ApiProperty() customerId!: string;
    @ApiProperty() restaurantId!: string;
    @ApiPropertyOptional({ nullable: true }) courierId!: string | null;
    @ApiProperty({ enum: OrderStatus }) status!: OrderStatus;
    @ApiProperty({ enum: PaymentMethod }) paymentMethod!: PaymentMethod;
    @ApiProperty({ enum: PaymentStatus }) paymentStatus!: PaymentStatus;
    @ApiProperty({ enum: Currency }) currency!: Currency;
    @ApiProperty() deliveryAddressText!: string;
    @ApiPropertyOptional({ nullable: true }) customerComment!: string | null;
    @ApiPropertyOptional({ nullable: true }) restaurantComment!: string | null;
    @ApiPropertyOptional({ nullable: true }) cancellationReason!: string | null;
    @ApiProperty() subtotalPrice!: number;
    @ApiProperty() deliveryFee!: number;
    @ApiProperty() serviceFee!: number;
    @ApiProperty() discountAmount!: number;
    @ApiProperty() totalPrice!: number;
    @ApiPropertyOptional({ nullable: true }) acceptedAt!: Date | null;
    @ApiPropertyOptional({ nullable: true }) readyAt!: Date | null;
    @ApiPropertyOptional({ nullable: true }) pickedUpAt!: Date | null;
    @ApiPropertyOptional({ nullable: true }) deliveredAt!: Date | null;
    @ApiPropertyOptional({ nullable: true }) cancelledAt!: Date | null;
    @ApiProperty({ type: [OrderItemResponseDto] }) items!: OrderItemResponseDto[];
    @ApiProperty({ type: [OrderStatusHistoryResponseDto] }) statusHistory!: OrderStatusHistoryResponseDto[];
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}
