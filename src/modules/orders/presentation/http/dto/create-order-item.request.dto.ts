import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateOrderItemRequestDto {
    @ApiProperty({ description: 'Menu item UUID' })
    @IsUUID()
    menuItemId!: string;

    @ApiProperty({ description: 'Quantity (min 1, max 99)', minimum: 1, maximum: 99 })
    @IsInt()
    @Min(1)
    @Max(99)
    quantity!: number;

    @ApiPropertyOptional({ description: 'Optional comment for this item' })
    @IsOptional()
    @IsString()
    comment?: string | null;
}
