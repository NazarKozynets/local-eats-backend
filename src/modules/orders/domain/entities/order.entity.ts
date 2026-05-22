import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Currency } from '../enums/currency.enum';
import { InvalidOrderStatusTransitionError } from '../errors/invalid-order-status-transition.error';
import { InvalidOrderCancellationError } from '../errors/invalid-order-cancellation.error';
import { OrderAccessDeniedError } from '../errors/order-access-denied.error';
import { EmptyOrderError } from '../errors/empty-order.error';
import type { OrderItem } from './order-item.entity';

type OrderProps = {
    id: UUID;
    publicCode: string;
    customerId: UUID;
    restaurantId: UUID;
    courierId: UUID | null;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    currency: Currency;
    deliveryAddressText: string;
    customerComment: string | null;
    restaurantComment: string | null;
    cancellationReason: string | null;
    subtotalPrice: number;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    totalPrice: number;
    acceptedAt: Date | null;
    readyAt: Date | null;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
    cancelledAt: Date | null;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
};

type CreateOrderProps = {
    id: UUID;
    publicCode: string;
    customerId: UUID;
    restaurantId: UUID;
    paymentMethod: PaymentMethod;
    currency: Currency;
    deliveryAddressText: string;
    customerComment: string | null;
    subtotalPrice: number;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    totalPrice: number;
    items: OrderItem[];
};

export class Order {
    private constructor(private readonly props: OrderProps) {}

    static create(p: CreateOrderProps): Order {
        if (p.items.length === 0) {
            throw new EmptyOrderError();
        }

        const now = new Date();

        return new Order({
            id: p.id,
            publicCode: p.publicCode,
            customerId: p.customerId,
            restaurantId: p.restaurantId,
            courierId: null,
            status: OrderStatus.CREATED,
            paymentMethod: p.paymentMethod,
            paymentStatus: PaymentStatus.PENDING,
            currency: p.currency,
            deliveryAddressText: p.deliveryAddressText,
            customerComment: p.customerComment,
            restaurantComment: null,
            cancellationReason: null,
            subtotalPrice: p.subtotalPrice,
            deliveryFee: p.deliveryFee,
            serviceFee: p.serviceFee,
            discountAmount: p.discountAmount,
            totalPrice: p.totalPrice,
            acceptedAt: null,
            readyAt: null,
            pickedUpAt: null,
            deliveredAt: null,
            cancelledAt: null,
            items: p.items,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: OrderProps): Order {
        return new Order(props);
    }

    acceptByRestaurant(restaurantComment?: string | null): void {
        if (this.props.status !== OrderStatus.CREATED) {
            throw new InvalidOrderStatusTransitionError(this.props.status, OrderStatus.ACCEPTED_BY_RESTAURANT);
        }

        this.props.status = OrderStatus.ACCEPTED_BY_RESTAURANT;
        this.props.acceptedAt = new Date();
        if (restaurantComment !== undefined) {
            this.props.restaurantComment = restaurantComment;
        }
        this.touch();
    }

    rejectByRestaurant(reason: string): void {
        if (this.props.status !== OrderStatus.CREATED) {
            throw new InvalidOrderStatusTransitionError(this.props.status, OrderStatus.REJECTED_BY_RESTAURANT);
        }

        this.props.status = OrderStatus.REJECTED_BY_RESTAURANT;
        this.props.cancellationReason = reason;
        this.touch();
    }

    startPreparation(): void {
        if (this.props.status !== OrderStatus.ACCEPTED_BY_RESTAURANT) {
            throw new InvalidOrderStatusTransitionError(this.props.status, OrderStatus.PREPARING);
        }

        this.props.status = OrderStatus.PREPARING;
        this.touch();
    }

    markReadyForPickup(): void {
        if (this.props.status !== OrderStatus.PREPARING) {
            throw new InvalidOrderStatusTransitionError(this.props.status, OrderStatus.READY_FOR_PICKUP);
        }

        this.props.status = OrderStatus.READY_FOR_PICKUP;
        this.props.readyAt = new Date();
        this.touch();
    }

    cancelByCustomer(actingCustomerId: string, reason?: string | null): void {
        if (this.props.customerId.value !== actingCustomerId) {
            throw new OrderAccessDeniedError();
        }

        if (this.props.status !== OrderStatus.CREATED) {
            throw new InvalidOrderCancellationError();
        }

        this.props.status = OrderStatus.CANCELLED;
        this.props.cancellationReason = reason ?? null;
        this.props.cancelledAt = new Date();

        if (this.props.paymentStatus === PaymentStatus.PENDING) {
            this.props.paymentStatus = PaymentStatus.CANCELLED;
        }

        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID { return this.props.id; }
    get publicCode(): string { return this.props.publicCode; }
    get customerId(): UUID { return this.props.customerId; }
    get restaurantId(): UUID { return this.props.restaurantId; }
    get courierId(): UUID | null { return this.props.courierId; }
    get status(): OrderStatus { return this.props.status; }
    get paymentMethod(): PaymentMethod { return this.props.paymentMethod; }
    get paymentStatus(): PaymentStatus { return this.props.paymentStatus; }
    get currency(): Currency { return this.props.currency; }
    get deliveryAddressText(): string { return this.props.deliveryAddressText; }
    get customerComment(): string | null { return this.props.customerComment; }
    get restaurantComment(): string | null { return this.props.restaurantComment; }
    get cancellationReason(): string | null { return this.props.cancellationReason; }
    get subtotalPrice(): number { return this.props.subtotalPrice; }
    get deliveryFee(): number { return this.props.deliveryFee; }
    get serviceFee(): number { return this.props.serviceFee; }
    get discountAmount(): number { return this.props.discountAmount; }
    get totalPrice(): number { return this.props.totalPrice; }
    get acceptedAt(): Date | null { return this.props.acceptedAt; }
    get readyAt(): Date | null { return this.props.readyAt; }
    get pickedUpAt(): Date | null { return this.props.pickedUpAt; }
    get deliveredAt(): Date | null { return this.props.deliveredAt; }
    get cancelledAt(): Date | null { return this.props.cancelledAt; }
    get items(): OrderItem[] { return this.props.items; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
