import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderStatusHistory } from '../../../domain/entities/order-status-history.entity';
import type { OrderStatus } from '../../../domain/enums/order-status.enum';

export class OrderStatusHistoryPrismaMapper {
    static toDomain(raw: any): OrderStatusHistory {
        return OrderStatusHistory.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            status: raw.status as OrderStatus,
            changedByUserId: raw.changedByUserId ?? null,
            comment: raw.comment ?? null,
            createdAt: raw.createdAt,
        });
    }
}
