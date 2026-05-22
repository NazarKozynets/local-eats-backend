import { Injectable } from '@nestjs/common';
import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import type { OrderStatusHistory } from '../../domain/entities/order-status-history.entity';
import type { OrderStatusHistoryRepository } from '../../application/ports/order-status-history.repository.port';
import { OrderStatusHistoryPrismaMapper } from './mappers/order-status-history-prisma.mapper';

@Injectable()
export class PrismaOrderStatusHistoryRepository implements OrderStatusHistoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findManyByOrderId(orderId: UUID): Promise<OrderStatusHistory[]> {
        const rows = await this.prisma.orderStatusHistory.findMany({
            where: { orderId: orderId.value },
            orderBy: { createdAt: 'asc' },
        });

        return rows.map(OrderStatusHistoryPrismaMapper.toDomain);
    }
}
