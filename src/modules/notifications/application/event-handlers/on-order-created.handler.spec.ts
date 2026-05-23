import { OnOrderCreatedHandler } from './on-order-created.handler';
import { OrderCreatedEvent } from '../../../orders/domain/events/order-created.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { NotificationType } from '../../domain/enums/notification-type.enum';

describe('OnOrderCreatedHandler', () => {
    let createNotification: jest.Mocked<{ execute: CreateNotificationUseCase['execute'] }>;
    let handler: OnOrderCreatedHandler;

    beforeEach(() => {
        createNotification = { execute: jest.fn().mockResolvedValue(undefined) };
        handler = new OnOrderCreatedHandler(createNotification as unknown as CreateNotificationUseCase);
    });

    it('creates a notification for the actor user when an order is created', async () => {
        const event = new OrderCreatedEvent(
            'order-id-1',
            'ORD-001',
            'customer-profile-id',
            'restaurant-id',
            'actor-user-id',
        );

        await handler.handle(event);

        expect(createNotification.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'actor-user-id',
                type: NotificationType.ORDER_CREATED,
                title: expect.any(String),
                body: expect.stringContaining('ORD-001'),
            }),
        );
    });
});
