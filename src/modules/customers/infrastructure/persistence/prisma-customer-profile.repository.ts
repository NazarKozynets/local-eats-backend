import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { CustomerProfile } from '../../domain/entities/customer-profile.entity';
import type { CustomerProfileRepository } from '../../application/ports/customer-profile.repository.port';
import { CustomerProfileMapper } from './customer-profile.mapper';

@Injectable()
export class PrismaCustomerProfileRepository implements CustomerProfileRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<CustomerProfile | null> {
        const row = await this.prisma.customerProfile.findUnique({
            where: { id: id.value },
        });

        return row ? CustomerProfileMapper.toDomain(row) : null;
    }

    async findByUserId(userId: UUID): Promise<CustomerProfile | null> {
        const row = await this.prisma.customerProfile.findUnique({
            where: { userId: userId.value },
        });

        return row ? CustomerProfileMapper.toDomain(row) : null;
    }

    async existsByUserId(userId: UUID): Promise<boolean> {
        const row = await this.prisma.customerProfile.findUnique({
            where: { userId: userId.value },
            select: { id: true },
        });

        return row !== null;
    }

    async save(profile: CustomerProfile): Promise<void> {
        const data = CustomerProfileMapper.toPersistence(profile);

        await this.prisma.customerProfile.upsert({
            where: { id: data.id },
            create: data,
            update: {
                displayName: data.displayName,
                avatarUrl: data.avatarUrl,
                updatedAt: data.updatedAt,
            },
        });
    }
}
