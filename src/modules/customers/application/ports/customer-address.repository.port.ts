import type { CustomerAddress } from '../../domain/entities/customer-address.entity';
import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

export const CUSTOMER_ADDRESS_REPOSITORY = Symbol('CUSTOMER_ADDRESS_REPOSITORY');

export interface CustomerAddressRepository {
    findById(id: UUID): Promise<CustomerAddress | null>;
    findManyByCustomerId(customerId: UUID): Promise<CustomerAddress[]>;
    countByCustomerId(customerId: UUID): Promise<number>;
    findOldestByCustomerId(customerId: UUID): Promise<CustomerAddress | null>;
    save(address: CustomerAddress): Promise<void>;
    delete(addressId: UUID): Promise<void>;
    setDefaultAddress(customerId: UUID, newDefaultAddressId: UUID): Promise<void>;
}
