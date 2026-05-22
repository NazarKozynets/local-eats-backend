import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export class AvailableCourierResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() userId!: string;
    @ApiPropertyOptional({ nullable: true }) displayName!: string | null;
    @ApiPropertyOptional({ enum: CourierVehicleType, nullable: true }) vehicleType!: CourierVehicleType | null;
    @ApiProperty() deliveryRadiusKm!: number;
    @ApiProperty() ratingAvg!: number;
    @ApiProperty() ratingCount!: number;
}
