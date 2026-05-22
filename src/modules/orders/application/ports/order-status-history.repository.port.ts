import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { OrderStatusHistory } from '../../domain/entities/order-status-history.entity';

export const ORDER_STATUS_HISTORY_REPOSITORY = Symbol('ORDER_STATUS_HISTORY_REPOSITORY');

export interface OrderStatusHistoryRepository {
    findManyByOrderId(orderId: UUID): Promise<OrderStatusHistory[]>;
}
