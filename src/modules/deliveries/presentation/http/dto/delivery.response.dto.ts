import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrderDeliveryView } from '../../../../orders/application/ports/order-delivery-reader.port';
import type { OrderStatus } from '../../../../orders/domain/enums/order-status.enum';

export class DeliveryResponseDto {
    @ApiProperty() orderId!: string;
    @ApiProperty() publicCode!: string;
    @ApiProperty() customerId!: string;
    @ApiProperty() restaurantId!: string;
    @ApiPropertyOptional({ nullable: true }) courierId!: string | null;
    @ApiProperty() status!: OrderStatus;
    @ApiProperty() deliveryAddressText!: string;
    @ApiPropertyOptional({ nullable: true }) pickedUpAt!: Date | null;
    @ApiPropertyOptional({ nullable: true }) deliveredAt!: Date | null;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;

    static fromView(view: OrderDeliveryView): DeliveryResponseDto {
        const dto = new DeliveryResponseDto();
        dto.orderId = view.orderId;
        dto.publicCode = view.publicCode;
        dto.customerId = view.customerId;
        dto.restaurantId = view.restaurantId;
        dto.courierId = view.courierId;
        dto.status = view.status;
        dto.deliveryAddressText = view.deliveryAddressText;
        dto.pickedUpAt = view.pickedUpAt;
        dto.deliveredAt = view.deliveredAt;
        dto.createdAt = view.createdAt;
        dto.updatedAt = view.updatedAt;
        return dto;
    }
}
