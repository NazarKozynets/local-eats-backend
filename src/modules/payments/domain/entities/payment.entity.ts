import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import type { DomainEvent } from '../../../../shared/domain/events/domain-event.base';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Currency } from '../enums/currency.enum';
import { InvalidPaymentAmountError } from '../errors/invalid-payment-amount.error';
import { InvalidPaymentCurrencyError } from '../errors/invalid-payment-currency.error';
import { InvalidPaymentStatusTransitionError } from '../errors/invalid-payment-status-transition.error';
import { PaymentCreatedEvent } from '../events/payment-created.event';
import { PaymentPaidEvent } from '../events/payment-paid.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';
import { PaymentCancelledEvent } from '../events/payment-cancelled.event';
import { PaymentStatusChangedEvent } from '../events/payment-status-changed.event';

export type PaymentProps = {
    id: UUID;
    orderId: UUID;
    provider: PaymentProvider;
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    providerPaymentId: string | null;
    failureReason: string | null;
    paidAt: Date | null;
    refundedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type CreatePaymentProps = {
    id: UUID;
    orderId: UUID;
    provider: PaymentProvider;
    amount: number;
    currency: Currency;
    providerPaymentId?: string | null;
};

export class Payment {
    private readonly _domainEvents: DomainEvent[] = [];
    private constructor(private readonly props: PaymentProps) {}

    static create(p: CreatePaymentProps): Payment {
        if (p.amount <= 0) {
            throw new InvalidPaymentAmountError();
        }

        const validCurrencies = Object.values(Currency) as string[];
        if (!validCurrencies.includes(p.currency)) {
            throw new InvalidPaymentCurrencyError(String(p.currency));
        }

        const validProviders = Object.values(PaymentProvider) as string[];
        if (!validProviders.includes(p.provider)) {
            throw new InvalidPaymentAmountError();
        }

        const now = new Date();
        const payment = new Payment({
            id: p.id,
            orderId: p.orderId,
            provider: p.provider,
            status: PaymentStatus.PENDING,
            amount: p.amount,
            currency: p.currency,
            providerPaymentId: p.providerPaymentId ?? null,
            failureReason: null,
            paidAt: null,
            refundedAt: null,
            createdAt: now,
            updatedAt: now,
        });

        payment._domainEvents.push(
            new PaymentCreatedEvent(
                p.id.value,
                p.orderId.value,
                p.provider,
                PaymentStatus.PENDING,
                p.amount,
                p.currency,
            ),
        );

        return payment;
    }

    static restore(props: PaymentProps): Payment {
        return new Payment(props);
    }

    markPaid(providerPaymentId?: string | null, paidAt?: Date): void {
        if (this.props.status !== PaymentStatus.PENDING) {
            throw new InvalidPaymentStatusTransitionError(this.props.status, PaymentStatus.PAID);
        }

        const previousStatus = this.props.status;
        const now = paidAt ?? new Date();

        this.props.status = PaymentStatus.PAID;
        this.props.providerPaymentId = providerPaymentId ?? null;
        this.props.paidAt = now;
        this.touch();

        this._domainEvents.push(
            new PaymentPaidEvent(this.props.id.value, this.props.orderId.value, this.props.providerPaymentId, now),
            new PaymentStatusChangedEvent(this.props.id.value, this.props.orderId.value, previousStatus, PaymentStatus.PAID),
        );
    }

    markFailed(reason: string): void {
        if (this.props.status !== PaymentStatus.PENDING) {
            throw new InvalidPaymentStatusTransitionError(this.props.status, PaymentStatus.FAILED);
        }

        const previousStatus = this.props.status;

        this.props.status = PaymentStatus.FAILED;
        this.props.failureReason = reason;
        this.touch();

        this._domainEvents.push(
            new PaymentFailedEvent(this.props.id.value, this.props.orderId.value, reason),
            new PaymentStatusChangedEvent(this.props.id.value, this.props.orderId.value, previousStatus, PaymentStatus.FAILED),
        );
    }

    refund(refundedAt?: Date): void {
        if (this.props.status !== PaymentStatus.PAID) {
            throw new InvalidPaymentStatusTransitionError(this.props.status, PaymentStatus.REFUNDED);
        }

        const previousStatus = this.props.status;
        const now = refundedAt ?? new Date();

        this.props.status = PaymentStatus.REFUNDED;
        this.props.refundedAt = now;
        this.touch();

        this._domainEvents.push(
            new PaymentRefundedEvent(this.props.id.value, this.props.orderId.value, now),
            new PaymentStatusChangedEvent(this.props.id.value, this.props.orderId.value, previousStatus, PaymentStatus.REFUNDED),
        );
    }

    cancel(): void {
        if (this.props.status !== PaymentStatus.PENDING) {
            throw new InvalidPaymentStatusTransitionError(this.props.status, PaymentStatus.CANCELLED);
        }

        const previousStatus = this.props.status;

        this.props.status = PaymentStatus.CANCELLED;
        this.touch();

        this._domainEvents.push(
            new PaymentCancelledEvent(this.props.id.value, this.props.orderId.value),
            new PaymentStatusChangedEvent(this.props.id.value, this.props.orderId.value, previousStatus, PaymentStatus.CANCELLED),
        );
    }

    pullDomainEvents(): DomainEvent[] {
        const events = [...this._domainEvents];
        this._domainEvents.length = 0;
        return events;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID { return this.props.id; }
    get orderId(): UUID { return this.props.orderId; }
    get provider(): PaymentProvider { return this.props.provider; }
    get status(): PaymentStatus { return this.props.status; }
    get amount(): number { return this.props.amount; }
    get currency(): Currency { return this.props.currency; }
    get providerPaymentId(): string | null { return this.props.providerPaymentId; }
    get failureReason(): string | null { return this.props.failureReason; }
    get paidAt(): Date | null { return this.props.paidAt; }
    get refundedAt(): Date | null { return this.props.refundedAt; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
