import type { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { Order } from '../../domain/entities/order.entity';
import type { OrderStatus } from '../../domain/enums/order-status.enum';

export type OrderStatusHistoryInput = {
    status: OrderStatus;
    changedByUserId: string | null;
    comment: string | null;
};

export type OrderListFilters = {
    status?: OrderStatus;
};

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
    findById(id: UUID): Promise<Order | null>;
    findByPublicCode(publicCode: string): Promise<Order | null>;
    findManyByCustomerId(customerId: UUID): Promise<Order[]>;
    findManyByRestaurantId(restaurantId: UUID, filters?: OrderListFilters): Promise<Order[]>;
    createWithItems(order: Order, historyEntry: OrderStatusHistoryInput): Promise<void>;
    saveWithHistory(order: Order, historyEntry: OrderStatusHistoryInput): Promise<void>;
}
