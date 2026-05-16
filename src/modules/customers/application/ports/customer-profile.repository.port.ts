import type { CustomerProfile } from '../../domain/entities/customer-profile.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const CUSTOMER_PROFILE_REPOSITORY = Symbol('CUSTOMER_PROFILE_REPOSITORY');

export interface CustomerProfileRepository {
    findById(id: UUID): Promise<CustomerProfile | null>;
    findByUserId(userId: UUID): Promise<CustomerProfile | null>;
    existsByUserId(userId: UUID): Promise<boolean>;
    save(profile: CustomerProfile): Promise<void>;
}
