import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';

export class SetCourierAvailabilityRequestDto {
    @ApiProperty({ enum: CourierAvailabilityStatus, example: CourierAvailabilityStatus.ONLINE })
    @IsEnum(CourierAvailabilityStatus)
    availabilityStatus!: CourierAvailabilityStatus;
}
