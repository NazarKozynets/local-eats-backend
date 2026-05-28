import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignCourierToOrderDto {
    @ApiProperty({ description: 'Courier profile UUID' })
    @IsUUID()
    courierProfileId!: string;
}
