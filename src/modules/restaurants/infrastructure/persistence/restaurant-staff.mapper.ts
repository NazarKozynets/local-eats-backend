import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantStaff } from '../../domain/entities/restaurant-staff.entity';
import type { RestaurantStaffRole } from '../../domain/enums/restaurant-staff-role.enum';

export class RestaurantStaffMapper {
    static toDomain(raw: any): RestaurantStaff {
        return RestaurantStaff.restore({
            id: UUID.create(raw.id),
            restaurantId: UUID.create(raw.restaurantId),
            userId: UUID.create(raw.userId),
            role: raw.role as RestaurantStaffRole,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(staff: RestaurantStaff) {
        return {
            id: staff.id.value,
            restaurantId: staff.restaurantId.value,
            userId: staff.userId.value,
            role: staff.role,
            createdAt: staff.createdAt,
            updatedAt: staff.updatedAt,
        };
    }
}
