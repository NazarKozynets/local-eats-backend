import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

export class OrderStatusHistoryResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty({ enum: OrderStatus }) status!: OrderStatus;
    @ApiPropertyOptional({ nullable: true }) changedByUserId!: string | null;
    @ApiPropertyOptional({ nullable: true }) comment!: string | null;
    @ApiProperty() createdAt!: Date;
}
