import { InProcessDomainEventPublisher } from '../../../../shared/infrastructure/events/in-process-domain-event-publisher';
import { OnRestaurantApprovedHandler } from './on-restaurant-approved.handler';
import { OnRestaurantRejectedHandler } from './on-restaurant-rejected.handler';
import { RestaurantApprovedEvent } from '../../../restaurants/domain/events/restaurant-approved.event';
import { RestaurantRejectedEvent } from '../../../restaurants/domain/events/restaurant-rejected.event';
import { CreateNotificationUseCase } from '../use-cases/create-notification/create-notification.use-case';
import type { RestaurantAccessReader } from '../../../restaurants/application/ports/restaurant-access-reader.port';

const mockCreateNotification = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as CreateNotificationUseCase;

const mockRestaurantAccessReader: jest.Mocked<Pick<RestaurantAccessReader, 'findOwnerUserIds'>> = {
    findOwnerUserIds: jest.fn(),
};

function buildPublisher(): InProcessDomainEventPublisher {
    const publisher = new InProcessDomainEventPublisher();
    const onApproved = new OnRestaurantApprovedHandler(
        mockRestaurantAccessReader as unknown as RestaurantAccessReader,
        mockCreateNotification,
    );
    const onRejected = new OnRestaurantRejectedHandler(
        mockRestaurantAccessReader as unknown as RestaurantAccessReader,
        mockCreateNotification,
    );
    publisher.subscribe(RestaurantApprovedEvent, e => onApproved.handle(e));
    publisher.subscribe(RestaurantRejectedEvent, e => onRejected.handle(e));
    return publisher;
}

describe('Restaurant notification event handlers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRestaurantAccessReader.findOwnerUserIds.mockResolvedValue(['owner-user-1']);
    });

    it('creates a RESTAURANT_VERIFICATION_CHANGED notification for each owner when RestaurantApprovedEvent is published', async () => {
        mockRestaurantAccessReader.findOwnerUserIds.mockResolvedValue(['owner-1', 'owner-2']);
        const publisher = buildPublisher();
        await publisher.publishAll([new RestaurantApprovedEvent('restaurant-1')]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(2);
        const calls = (mockCreateNotification.execute as jest.Mock).mock.calls;
        expect(calls[0][0].type).toBe('RESTAURANT_VERIFICATION_CHANGED');
        expect(calls[0][0].userId).toBe('owner-1');
        expect(calls[1][0].userId).toBe('owner-2');
    });

    it('creates a RESTAURANT_VERIFICATION_CHANGED notification with reason when RestaurantRejectedEvent is published', async () => {
        const publisher = buildPublisher();
        await publisher.publishAll([new RestaurantRejectedEvent('restaurant-1', 'Invalid documents')]);
        expect(mockCreateNotification.execute).toHaveBeenCalledTimes(1);
        const cmd = (mockCreateNotification.execute as jest.Mock).mock.calls[0][0];
        expect(cmd.type).toBe('RESTAURANT_VERIFICATION_CHANGED');
        expect(cmd.userId).toBe('owner-user-1');
        expect(cmd.body).toContain('Invalid documents');
    });

    it('does not create a notification when no owners found for RestaurantApprovedEvent', async () => {
        mockRestaurantAccessReader.findOwnerUserIds.mockResolvedValue([]);
        const publisher = buildPublisher();
        await publisher.publishAll([new RestaurantApprovedEvent('restaurant-missing')]);
        expect(mockCreateNotification.execute).not.toHaveBeenCalled();
    });

    it('does not create a notification when no owners found for RestaurantRejectedEvent', async () => {
        mockRestaurantAccessReader.findOwnerUserIds.mockResolvedValue([]);
        const publisher = buildPublisher();
        await publisher.publishAll([new RestaurantRejectedEvent('restaurant-missing', 'reason')]);
        expect(mockCreateNotification.execute).not.toHaveBeenCalled();
    });
});
