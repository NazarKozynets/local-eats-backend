import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CustomerAddress } from '../../domain/entities/customer-address.entity';
import type { CustomerAddressRepository } from '../../application/ports/customer-address.repository.port';
import { CustomerAddressMapper } from './customer-address.mapper';

@Injectable()
export class PrismaCustomerAddressRepository implements CustomerAddressRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<CustomerAddress | null> {
        const row = await this.prisma.customerAddress.findUnique({
            where: { id: id.value },
        });

        return row ? CustomerAddressMapper.toDomain(row) : null;
    }

    async findManyByCustomerId(customerId: UUID): Promise<CustomerAddress[]> {
        const rows = await this.prisma.customerAddress.findMany({
            where: { customerId: customerId.value },
            orderBy: { createdAt: 'asc' },
        });

        return rows.map((row) => CustomerAddressMapper.toDomain(row));
    }

    async countByCustomerId(customerId: UUID): Promise<number> {
        return this.prisma.customerAddress.count({
            where: { customerId: customerId.value },
        });
    }

    async findOldestByCustomerId(customerId: UUID): Promise<CustomerAddress | null> {
        const row = await this.prisma.customerAddress.findFirst({
            where: { customerId: customerId.value },
            orderBy: { createdAt: 'asc' },
        });

        return row ? CustomerAddressMapper.toDomain(row) : null;
    }

    async save(address: CustomerAddress): Promise<void> {
        const data = CustomerAddressMapper.toPersistence(address);

        await this.prisma.customerAddress.upsert({
            where: { id: data.id },
            create: data,
            update: {
                label: data.label,
                city: data.city,
                street: data.street,
                building: data.building,
                apartment: data.apartment,
                entrance: data.entrance,
                floor: data.floor,
                comment: data.comment,
                isDefault: data.isDefault,
                updatedAt: data.updatedAt,
            },
        });
    }

    async delete(addressId: UUID): Promise<void> {
        await this.prisma.customerAddress.delete({
            where: { id: addressId.value },
        });
    }

    async setDefaultAddress(customerId: UUID, newDefaultAddressId: UUID): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.customerAddress.updateMany({
                where: { customerId: customerId.value, isDefault: true },
                data: { isDefault: false },
            }),
            this.prisma.customerAddress.update({
                where: { id: newDefaultAddressId.value },
                data: { isDefault: true },
            }),
        ]);
    }
}
