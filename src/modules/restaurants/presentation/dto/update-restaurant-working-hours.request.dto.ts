import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkingHourEntryDto {
    @ApiProperty({ example: 1, description: 'Day of week: 1=Monday, 7=Sunday' })
    @IsInt()
    @Min(1)
    @Max(7)
    dayOfWeek!: number;

    @ApiPropertyOptional({ example: '09:00', description: 'Opening time in HH:mm format. Required when isClosed is false.', nullable: true })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'opensAt must be in HH:mm format' })
    opensAt?: string | null;

    @ApiPropertyOptional({ example: '22:00', description: 'Closing time in HH:mm format. Required when isClosed is false.', nullable: true })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'closesAt must be in HH:mm format' })
    closesAt?: string | null;

    @ApiProperty({ example: false })
    @IsBoolean()
    isClosed!: boolean;
}

export class UpdateRestaurantWorkingHoursRequestDto {
    @ApiProperty({ type: [WorkingHourEntryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkingHourEntryDto)
    hours!: WorkingHourEntryDto[];
}
