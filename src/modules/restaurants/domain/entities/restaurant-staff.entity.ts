import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantStaffRole } from '../enums/restaurant-staff-role.enum';

type RestaurantStaffProps = {
    id: UUID;
    restaurantId: UUID;
    userId: UUID;
    role: RestaurantStaffRole;
    createdAt: Date;
    updatedAt: Date;
};

type CreateRestaurantStaffProps = {
    id: UUID;
    restaurantId: UUID;
    userId: UUID;
    role: RestaurantStaffRole;
};

export class RestaurantStaff {
    private constructor(private readonly props: RestaurantStaffProps) {}

    static create(p: CreateRestaurantStaffProps): RestaurantStaff {
        const now = new Date();

        return new RestaurantStaff({
            id: p.id,
            restaurantId: p.restaurantId,
            userId: p.userId,
            role: p.role,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestaurantStaffProps): RestaurantStaff {
        return new RestaurantStaff(props);
    }

    isOwner(): boolean {
        return this.props.role === RestaurantStaffRole.OWNER;
    }

    belongsToUser(userId: UUID): boolean {
        return this.props.userId.value === userId.value;
    }

    get id(): UUID { return this.props.id; }
    get restaurantId(): UUID { return this.props.restaurantId; }
    get userId(): UUID { return this.props.userId; }
    get role(): RestaurantStaffRole { return this.props.role; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
