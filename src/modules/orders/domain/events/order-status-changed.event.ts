import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import type { OrderStatus } from '../enums/order-status.enum';

export class OrderStatusChangedEvent extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly publicCode: string,
        public readonly customerId: string,
        public readonly restaurantId: string,
        public readonly previousStatus: OrderStatus,
        public readonly newStatus: OrderStatus,
        public readonly actorUserId: string,
    ) {
        super();
    }
}
