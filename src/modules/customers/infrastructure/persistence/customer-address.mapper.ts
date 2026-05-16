import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CustomerAddress } from '../../domain/entities/customer-address.entity';

export class CustomerAddressMapper {
    static toDomain(raw: any): CustomerAddress {
        return CustomerAddress.restore({
            id: UUID.create(raw.id),
            customerId: UUID.create(raw.customerId),
            label: raw.label ?? null,
            city: raw.city,
            street: raw.street,
            building: raw.building,
            apartment: raw.apartment ?? null,
            entrance: raw.entrance ?? null,
            floor: raw.floor ?? null,
            comment: raw.comment ?? null,
            isDefault: raw.isDefault,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(address: CustomerAddress) {
        return {
            id: address.id.value,
            customerId: address.customerId.value,
            label: address.label,
            city: address.city,
            street: address.street,
            building: address.building,
            apartment: address.apartment,
            entrance: address.entrance,
            floor: address.floor,
            comment: address.comment,
            isDefault: address.isDefault,
            createdAt: address.createdAt,
            updatedAt: address.updatedAt,
        };
    }
}
