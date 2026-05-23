import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { Payment } from '../../domain/entities/payment.entity';
import type { PaymentRepository } from '../../application/ports/payment.repository.port';
import { PaymentPrismaMapper } from './mappers/payment-prisma.mapper';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: UUID): Promise<Payment | null> {
        const row = await this.prisma.payment.findUnique({ where: { id: id.value } });
        return row ? PaymentPrismaMapper.toDomain(row) : null;
    }

    async findByOrderId(orderId: UUID): Promise<Payment | null> {
        const row = await this.prisma.payment.findUnique({ where: { orderId: orderId.value } });
        return row ? PaymentPrismaMapper.toDomain(row) : null;
    }

    async findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
        const row = await this.prisma.payment.findFirst({
            where: { providerPaymentId },
        });
        return row ? PaymentPrismaMapper.toDomain(row) : null;
    }

    async existsByOrderId(orderId: UUID): Promise<boolean> {
        const count = await this.prisma.payment.count({ where: { orderId: orderId.value } });
        return count > 0;
    }

    async save(payment: Payment): Promise<void> {
        const data = PaymentPrismaMapper.toPersistence(payment);
        await this.prisma.payment.create({ data });
    }

    async update(payment: Payment): Promise<void> {
        const data = PaymentPrismaMapper.toPersistence(payment);
        await this.prisma.payment.update({
            where: { id: data.id },
            data: {
                status: data.status,
                providerPaymentId: data.providerPaymentId,
                failureReason: data.failureReason,
                paidAt: data.paidAt,
                refundedAt: data.refundedAt,
                updatedAt: data.updatedAt,
            },
        });
    }
}
