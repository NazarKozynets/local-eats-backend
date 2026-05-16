import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CustomerDisplayName } from '../../domain/value-objects/customer-display-name.vo';
import { CustomerProfile } from '../../domain/entities/customer-profile.entity';

export class CustomerProfileMapper {
    static toDomain(raw: any): CustomerProfile {
        return CustomerProfile.restore({
            id: UUID.create(raw.id),
            userId: UUID.create(raw.userId),
            displayName: raw.displayName ? CustomerDisplayName.create(raw.displayName) : null,
            avatarUrl: raw.avatarUrl ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(profile: CustomerProfile) {
        return {
            id: profile.id.value,
            userId: profile.userId.value,
            displayName: profile.displayName?.value ?? null,
            avatarUrl: profile.avatarUrl,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
