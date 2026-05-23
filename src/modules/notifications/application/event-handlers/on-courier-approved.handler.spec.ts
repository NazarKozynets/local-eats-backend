import { OnCourierApprovedHandler } from './on-courier-approved.handler';
import { CourierApprovedEvent } from '../../../couriers/domain/events/courier-approved.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import { NotificationType } from '../../domain/enums/notification-type.enum';

describe('OnCourierApprovedHandler', () => {
    let createNotification: jest.Mocked<{ execute: CreateNotificationUseCase['execute'] }>;
    let handler: OnCourierApprovedHandler;

    beforeEach(() => {
        createNotification = { execute: jest.fn().mockResolvedValue(undefined) };
        handler = new OnCourierApprovedHandler(createNotification as unknown as CreateNotificationUseCase);
    });

    it('creates a COURIER_VERIFICATION_CHANGED notification for the courier user', async () => {
        const event = new CourierApprovedEvent('courier-profile-id', 'courier-user-id', 'admin-user-id');

        await handler.handle(event);

        expect(createNotification.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'courier-user-id',
                type: NotificationType.COURIER_VERIFICATION_CHANGED,
                title: expect.any(String),
                body: expect.any(String),
            }),
        );
    });
});
