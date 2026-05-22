import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { OrderStatus } from '../enums/order-status.enum';

type OrderStatusHistoryProps = {
    id: UUID;
    orderId: UUID;
    status: OrderStatus;
    changedByUserId: string | null;
    comment: string | null;
    createdAt: Date;
};

type CreateOrderStatusHistoryProps = {
    id: UUID;
    orderId: UUID;
    status: OrderStatus;
    changedByUserId: string | null;
    comment: string | null;
};

export class OrderStatusHistory {
    private constructor(private readonly props: OrderStatusHistoryProps) {}

    static create(p: CreateOrderStatusHistoryProps): OrderStatusHistory {
        return new OrderStatusHistory({ ...p, createdAt: new Date() });
    }

    static restore(props: OrderStatusHistoryProps): OrderStatusHistory {
        return new OrderStatusHistory(props);
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get status(): OrderStatus { return this.props.status; }
    get changedByUserId(): string | null { return this.props.changedByUserId; }
    get comment(): string | null { return this.props.comment; }
    get createdAt(): Date { return this.props.createdAt; }
}
