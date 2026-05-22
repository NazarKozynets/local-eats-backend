import { ApiProperty } from '@nestjs/swagger';

export class MenuCategoryResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() restaurantId!: string;
    @ApiProperty() name!: string;
    @ApiProperty() position!: number;
    @ApiProperty() isActive!: boolean;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}
