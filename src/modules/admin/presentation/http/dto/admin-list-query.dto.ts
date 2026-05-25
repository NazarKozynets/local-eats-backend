import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}

export class AdminUsersQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by role' })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ description: 'Filter by status' })
    @IsOptional()
    @IsString()
    status?: string;
}

export class AdminRestaurantsQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by status' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Filter by verification status' })
    @IsOptional()
    @IsString()
    verificationStatus?: string;
}

export class AdminCouriersQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by verification status' })
    @IsOptional()
    @IsString()
    verificationStatus?: string;

    @ApiPropertyOptional({ description: 'Filter by profile status' })
    @IsOptional()
    @IsString()
    profileStatus?: string;
}

export class AdminOrdersQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by status' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Filter by restaurant ID' })
    @IsOptional()
    @IsString()
    restaurantId?: string;

    @ApiPropertyOptional({ description: 'Filter by courier ID' })
    @IsOptional()
    @IsString()
    courierId?: string;

    @ApiPropertyOptional({ description: 'Filter by customer ID' })
    @IsOptional()
    @IsString()
    customerId?: string;
}

export class AdminPaymentsQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by status' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Filter by provider' })
    @IsOptional()
    @IsString()
    provider?: string;
}

export class AdminDeliveryProblemsQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by status' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Filter by type' })
    @IsOptional()
    @IsString()
    type?: string;
}

export class AdminReviewsQueryDto extends AdminListQueryDto {
    @ApiPropertyOptional({ description: 'Filter by target (RESTAURANT or COURIER)' })
    @IsOptional()
    @IsString()
    target?: string;

    @ApiPropertyOptional({ description: 'Filter by restaurant ID' })
    @IsOptional()
    @IsString()
    restaurantId?: string;

    @ApiPropertyOptional({ description: 'Filter by courier ID' })
    @IsOptional()
    @IsString()
    courierId?: string;
}
