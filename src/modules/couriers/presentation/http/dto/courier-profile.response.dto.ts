import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';

export class CourierProfileResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() userId!: string;
    @ApiPropertyOptional({ nullable: true }) displayName!: string | null;
    @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
    @ApiProperty({ enum: CourierVerificationStatus }) verificationStatus!: CourierVerificationStatus;
    @ApiPropertyOptional({ nullable: true }) verificationRejectedReason!: string | null;
    @ApiPropertyOptional({ type: String, nullable: true }) verifiedAt!: Date | null;
    @ApiProperty({ enum: CourierProfileStatus }) profileStatus!: CourierProfileStatus;
    @ApiProperty({ enum: CourierAvailabilityStatus }) availabilityStatus!: CourierAvailabilityStatus;
    @ApiPropertyOptional({ enum: CourierVehicleType, nullable: true }) vehicleType!: CourierVehicleType | null;
    @ApiProperty() deliveryRadiusKm!: number;
    @ApiProperty() completedDeliveriesCount!: number;
    @ApiProperty() ratingAvg!: number;
    @ApiProperty() ratingCount!: number;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}
