import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
    @ApiProperty() id!: string;
    @ApiPropertyOptional({ nullable: true }) menuItemId!: string | null;
    @ApiProperty() nameSnapshot!: string;
    @ApiProperty() priceSnapshot!: number;
    @ApiProperty() quantity!: number;
    @ApiPropertyOptional({ nullable: true }) comment!: string | null;
    @ApiProperty() totalPriceSnapshot!: number;
    @ApiProperty() createdAt!: Date;
}
