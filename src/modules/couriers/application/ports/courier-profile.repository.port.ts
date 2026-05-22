import type { CourierProfile } from '../../domain/entities/courier-profile.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const COURIER_PROFILE_REPOSITORY = Symbol('COURIER_PROFILE_REPOSITORY');

export interface CourierProfileRepository {
    findById(id: UUID): Promise<CourierProfile | null>;
    findByUserId(userId: UUID): Promise<CourierProfile | null>;
    existsByUserId(userId: UUID): Promise<boolean>;
    save(profile: CourierProfile): Promise<void>;
    findAvailable(): Promise<CourierProfile[]>;
}
