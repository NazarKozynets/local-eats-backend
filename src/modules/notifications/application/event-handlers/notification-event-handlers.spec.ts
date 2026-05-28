import { InProcessDomainEventPublisher } from '../../../../shared/infrastructure/events/in-process-domain-event-publisher';
import { OnOrderCreatedHandler } from './on-order-created.handler';
import { OnOrderStatusChangedHandler } from './on-order-status-changed.handler';
import { OnCourierApprovedHandler } from './on-courier-approved.handler';
import { OnCourierRejectedHandler } from './on-courier-rejected.handler';
import { OnPaymentPaidHandler } from './on-payment-paid.handler';
import { OnPaymentFailedHandler } from './on-payment-failed.handler';
import { OnPaymentRefundedHandler } from './on-payment-refunded.handler';
import { OnDeliveryAssignedHandler } from './on-delivery-assigned.handler';
import { OnOrderDeliveredHandler } from './on-order-delivered.handler';
import { OrderCreatedEvent } from '../../../orders/domain/events/order-created.event';
import { OrderStatusChangedEvent } from '../../../orders/domain/events/order-status-changed.event';
import { CourierApprovedEvent } from '../../../couriers/domain/events/courier-approved.event';
import { CourierRejectedEvent } from '../../../couriers/domain/events/courier-rejected.event';
import { PaymentPaidEvent } from '../../../payments/domain/events/payment-paid.event';
import { PaymentFailedEvent } from '../../../payments/domain/events/payment-failed.event';
import { PaymentRefundedEvent } from '../../../payments/domain/events/payment-refunded.event';
import { DeliveryAssignedEvent } from '../../../deliveries/domain/events/delivery-assigned.event';
import { OrderDeliveredEvent } from '../../../deliveries/domain/events/order-delivered.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import type { OrderPaymentReader } from '../../../payments/application/ports/order-payment-reader.port';
import type { CourierAccessReader } from '../../../couriers/application/ports/courier-access-reader.port';

const mockCreateNotification = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as CreateNotificationUseCase;

const mockOrderPaymentReader: jest.Mocked<Pick<OrderPaymentReader, 'getOrderPaymentInfo'>> = {
    getOrderPaymentInfo: jest.fn(),
};

const mockCourierAccessReader: jest.Mocked<Pick<CourierAccessReader, 'findById'>> = {
    findById: jest.fn(),
};

function buildPublisherWithNotifications(): InProcessDomainEventPublisher {
    const publisher = new InProcessDomainEventPublisher();
    const onOrderCreated = new OnOrderCreatedHandler(mockCreateNotification);
    const onOrderStatusChanged = new OnOrderStatusChangedHandler(mockOrderPaymentReader as unknown as OrderPaymentReader, mockCreateNotification);
    const onCourierApproved = new OnCourierApprovedHandler(mockCreateNotification);
    const onCourierRejected = new OnCourierRejectedHandler(mockCreateNotification);
    const onPaymentPaid = new OnPaymentPaidHandler(mockOrderPaymentReader as unknown as OrderPaymentReader, mockCreateNotification);
    const onPaymentFailed = new OnPaymentFailedHandler(mockOrderPaymentReader as unknown as OrderPaymentReader, mockCreateNotification);
    const onPaymentRefunded = new OnPaymentRefundedHandler(mockOrderPaymentReader as unknown as OrderPaymentReader, mockCreateNotification);
    const onDeliveryAssigned = new OnDeliveryAssignedHandler(mockCourierAccessReader as unknown as CourierAccessReader, mockCreateNotification);
    const onOrderDelivered = new OnOrderDeliveredHandler(mockOrderPaymentReader as unknown as OrderPaymentReader, mockCreateNotification);

    publisher.subscribe(OrderCreatedEvent, e => onOrderCreated.handle(e));
    publisher.subscribe(OrderStatusChangedEvent, e => onOrderStatusChanged.handle(e));
    publisher.subscribe(CourierApprovedEvent, e => onCourierApproved.handle(e));
    publisher.subscribe(CourierRejectedEvent, e => onCourierRejected.handle(e));
    publisher.subscribe(PaymentPaidEvent, e => onPaymentPaid.handle(e));
    publisher.subscribe(PaymentFailedEvent, e => onPaymentFailed.handle(e));
    publisher.subscribe(PaymentRefundedEvent, e => onPaymentRefunded.handle(e));
    publisher.subscribe(DeliveryAssignedEvent, e => onDeliveryAssigned.handle(e));
    publisher.subscribe(OrderDeliveredEvent, e => onOrderDelivered.handle(e));
    return publisher;
}

describe('Notification event handler wiring', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOrderPaymentReader.getOrderPaymentInfo.mockResolvedValue({
            orderId: 'order-1',
            customerId: 'customer-profile-1',
            customerUserId: 'customer-user-1',
            restaurantId: 'restaurant-1',
            totalPrice: 100,
            currency: 'USD' as any,
            paymentMethod: 'CASH' as any,
            paymentStatus: 'PAID' as any,
            orderStatus: 'DELIVERED' as any,
        });
        mockCourierAccessReader.findById.mockResolvedValue({
            courierProfileId: 'courier-profile-1',
            userId: 'courier-user-1',
            profileStatus: 'ACTIVE' as any,
            verificationStatus: 'VERIFIED' as any,
            availabilityStatus: 'AVAILABLE' as any,
            vehicleType: null,
            deliveryRadiusKm: 10,
            ratingAvg: 4.5,
            ratingCount: 10,
        });
    });

    it('creates a notification when OrderCreatedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new OrderCreatedEvent('order-1', 'ORD-001', 'customer-profile-1', 'restaurant-1', 'user-1'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('ORDER_CREATED');
        expect(cmd.userId).toBe('user-1');
    });

    it('creates a notification for the customer when OrderStatusChangedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new OrderStatusChangedEvent('order-1', 'ORD-001', 'customer-profile-1', 'restaurant-1', 'CREATED' as any, 'ACCEPTED' as any, 'manager-1'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('ORDER_STATUS_CHANGED');
        expect(cmd.userId).toBe('customer-user-1');
    });

    it('creates a notification when CourierApprovedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new CourierApprovedEvent('courier-profile-1', 'courier-user-1', 'admin-1'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('COURIER_VERIFICATION_CHANGED');
        expect(cmd.userId).toBe('courier-user-1');
    });

    it('creates a notification when CourierRejectedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new CourierRejectedEvent('courier-profile-1', 'courier-user-1', 'admin-1', 'Documents invalid'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('COURIER_VERIFICATION_CHANGED');
        expect(cmd.body).toContain('Documents invalid');
    });

    it('creates a PAYMENT_STATUS_CHANGED notification for customer when PaymentPaidEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new PaymentPaidEvent('payment-1', 'order-1', null, new Date()),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('PAYMENT_STATUS_CHANGED');
        expect(cmd.userId).toBe('customer-user-1');
    });

    it('creates a PAYMENT_STATUS_CHANGED notification for customer when PaymentFailedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new PaymentFailedEvent('payment-1', 'order-1', 'Insufficient funds'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('PAYMENT_STATUS_CHANGED');
        expect(cmd.userId).toBe('customer-user-1');
        expect(cmd.body).toContain('Insufficient funds');
    });

    it('creates a PAYMENT_STATUS_CHANGED notification for customer when PaymentRefundedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new PaymentRefundedEvent('payment-1', 'order-1', new Date()),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('PAYMENT_STATUS_CHANGED');
        expect(cmd.userId).toBe('customer-user-1');
    });

    it('creates an ORDER_ASSIGNED notification for the courier when DeliveryAssignedEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new DeliveryAssignedEvent('order-1', 'courier-profile-1', 'actor-1'),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('ORDER_ASSIGNED');
        expect(cmd.userId).toBe('courier-user-1');
    });

    it('creates an ORDER_STATUS_CHANGED notification for customer when OrderDeliveredEvent is published', async () => {
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new OrderDeliveredEvent('order-1', 'courier-user-1', new Date()),
        ]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('ORDER_STATUS_CHANGED');
        expect(cmd.userId).toBe('customer-user-1');
        expect(cmd.title).toContain('delivered');
    });

    it('does not create a notification when order info is not found for PaymentPaidEvent', async () => {
        mockOrderPaymentReader.getOrderPaymentInfo.mockResolvedValue(null);
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new PaymentPaidEvent('payment-1', 'order-missing', null, new Date()),
        ]);
        expect(mockCreateNotification.execute).not.toHaveBeenCalled();
    });

    it('does not create a notification when order info is not found for OrderStatusChangedEvent', async () => {
        mockOrderPaymentReader.getOrderPaymentInfo.mockResolvedValue(null);
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new OrderStatusChangedEvent('order-missing', 'ORD-999', 'customer-profile-1', 'restaurant-1', 'CREATED' as any, 'ACCEPTED' as any, 'manager-1'),
        ]);
        expect(mockCreateNotification.execute).not.toHaveBeenCalled();
    });

    it('does not create a notification when courier profile is not found for DeliveryAssignedEvent', async () => {
        mockCourierAccessReader.findById.mockResolvedValue(null);
        const publisher = buildPublisherWithNotifications();
        await publisher.publishAll([
            new DeliveryAssignedEvent('order-1', 'courier-missing', 'actor-1'),
        ]);
        expect(mockCreateNotification.execute).not.toHaveBeenCalled();
    });
});
