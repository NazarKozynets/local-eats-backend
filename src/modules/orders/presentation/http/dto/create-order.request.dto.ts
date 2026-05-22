import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';
import { CreateOrderItemRequestDto } from './create-order-item.request.dto';

export class CreateOrderRequestDto {
    @ApiProperty({ description: 'Restaurant UUID' })
    @IsUUID()
    restaurantId!: string;

    @ApiProperty({ description: 'Customer delivery address UUID' })
    @IsUUID()
    customerAddressId!: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @ApiPropertyOptional({ description: 'Optional comment for the restaurant' })
    @IsOptional()
    @IsString()
    customerComment?: string | null;

    @ApiProperty({ type: [CreateOrderItemRequestDto] })
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => CreateOrderItemRequestDto)
    items!: CreateOrderItemRequestDto[];
}
