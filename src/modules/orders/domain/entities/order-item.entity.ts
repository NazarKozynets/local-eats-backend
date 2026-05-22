import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

type OrderItemProps = {
    id: UUID;
    orderId: UUID;
    menuItemId: UUID | null;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    comment: string | null;
    totalPriceSnapshot: number;
    createdAt: Date;
};

type CreateOrderItemProps = {
    id: UUID;
    orderId: UUID;
    menuItemId: UUID | null;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    comment: string | null;
};

export class OrderItem {
    private constructor(private readonly props: OrderItemProps) {}

    static create(p: CreateOrderItemProps): OrderItem {
        return new OrderItem({
            ...p,
            totalPriceSnapshot: Math.round(p.priceSnapshot * p.quantity * 100) / 100,
            createdAt: new Date(),
        });
    }

    static restore(props: OrderItemProps): OrderItem {
        return new OrderItem(props);
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get menuItemId(): UUID | null { return this.props.menuItemId; }
    get nameSnapshot(): string { return this.props.nameSnapshot; }
    get priceSnapshot(): number { return this.props.priceSnapshot; }
    get quantity(): number { return this.props.quantity; }
    get comment(): string | null { return this.props.comment; }
    get totalPriceSnapshot(): number { return this.props.totalPriceSnapshot; }
    get createdAt(): Date { return this.props.createdAt; }
}
