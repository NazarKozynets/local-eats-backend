import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type {
    CustomerOrderReader,
    CustomerProfileReadModel,
    CustomerAddressReadModel,
} from '../../application/ports/customer-order-reader.port';

@Injectable()
export class PrismaCustomerOrderReader implements CustomerOrderReader {
    constructor(private readonly prisma: PrismaService) {}

    async getProfileByUserId(userId: string): Promise<CustomerProfileReadModel | null> {
        const row = await this.prisma.customerProfile.findUnique({
            where: { userId },
            select: { id: true, userId: true },
        });

        return row ? { id: row.id, userId: row.userId } : null;
    }

    async getAddress(customerId: string, addressId: string): Promise<CustomerAddressReadModel | null> {
        const row = await this.prisma.customerAddress.findUnique({
            where: { id: addressId },
            select: {
                id: true,
                customerId: true,
                label: true,
                city: true,
                street: true,
                building: true,
                apartment: true,
                entrance: true,
                floor: true,
                comment: true,
            },
        });

        if (!row || row.customerId !== customerId) {
            return null;
        }

        return {
            id: row.id,
            customerId: row.customerId,
            label: row.label ?? null,
            city: row.city,
            street: row.street,
            building: row.building,
            apartment: row.apartment ?? null,
            entrance: row.entrance ?? null,
            floor: row.floor ?? null,
            comment: row.comment ?? null,
        };
    }
}
