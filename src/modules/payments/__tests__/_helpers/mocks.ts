import type { PaymentRepository } from '../../application/ports/payment.repository.port';
import type { OrderPaymentReader } from '../../application/ports/order-payment-reader.port';
import type { OrderPaymentWriter } from '../../application/ports/order-payment-writer.port';
import type { PaymentProviderPort } from '../../application/ports/payment-provider.port';
import type { DomainEventPublisher } from '../../../../shared/domain/events/domain-event-publisher.port';

export function createMockPaymentRepository(): jest.Mocked<PaymentRepository> {
    return {
        findById: jest.fn(),
        findByOrderId: jest.fn(),
        findByProviderPaymentId: jest.fn(),
        existsByOrderId: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    };
}

export function createMockOrderPaymentReader(): jest.Mocked<OrderPaymentReader> {
    return {
        getOrderPaymentInfo: jest.fn(),
        canUserAccessOrderPayment: jest.fn(),
    };
}

export function createMockOrderPaymentWriter(): jest.Mocked<OrderPaymentWriter> {
    return {
        updateOrderPaymentStatus: jest.fn(),
    };
}

export function createMockPaymentProvider(): jest.Mocked<PaymentProviderPort> {
    return {
        providerName: jest.fn() as unknown as PaymentProviderPort['providerName'],
        createPayment: jest.fn(),
        parseWebhook: jest.fn(),
    };
}

export function createMockEventPublisher(): jest.Mocked<DomainEventPublisher> {
    return {
        publishAll: jest.fn(),
    };
}
