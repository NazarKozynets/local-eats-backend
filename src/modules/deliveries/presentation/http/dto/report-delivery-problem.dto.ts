import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength, MaxLength } from 'class-validator';
import { DeliveryProblemType } from '../../../domain/enums/delivery-problem-type.enum';

export class ReportDeliveryProblemDto {
    @ApiProperty({ enum: DeliveryProblemType })
    @IsEnum(DeliveryProblemType)
    type!: DeliveryProblemType;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    description!: string;
}
