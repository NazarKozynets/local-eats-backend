import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export class CreateCourierProfileRequestDto {
    @ApiPropertyOptional({ example: 'John D.', maxLength: 100 })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    displayName?: string | null;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/john.jpg', nullable: true })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string | null;

    @ApiPropertyOptional({ enum: CourierVehicleType, example: CourierVehicleType.BICYCLE })
    @IsOptional()
    @IsEnum(CourierVehicleType)
    vehicleType?: CourierVehicleType | null;

    @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 200 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(200)
    deliveryRadiusKm?: number;
}
