import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { RestaurantStaffRole } from '../../domain/enums/restaurant-staff-role.enum';

export class AddRestaurantStaffRequestDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'IAM user id to add as staff' })
    @IsUUID()
    userId!: string;

    @ApiProperty({ enum: RestaurantStaffRole, example: RestaurantStaffRole.MANAGER })
    @IsEnum(RestaurantStaffRole)
    role!: RestaurantStaffRole;
}
